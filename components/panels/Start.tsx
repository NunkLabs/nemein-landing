import { Fragment, useState } from "react";
import { AnimatePresence, m } from "framer-motion";

import { useGameStore } from "libs/Store";
import { buttonVariants } from "components/ui/Button";
import OptionsPanel from "./Options";

export default function StartPanel({ startGame }: { startGame: () => void }) {
  const gameLoadStates = useGameStore((state) => state.gameLoadStates);
  const updateGameLoadStates = useGameStore(
    (state) => state.updateGameLoadStates,
  );

  const [presence, setPresence] = useState<boolean>(true);

  return (
    presence && (
      <div className="fixed left-1/2 top-1/2 z-50 flex h-32 translate-x-[-50%] translate-y-[-50%] flex-col gap-y-2 text-center">
        {gameLoadStates.gameRequest ? (
          /**
           * We don't need the enter animation handling because the static
           * header is our placeholder until we need this loading animation.
           */
          <AnimatePresence
            onExitComplete={() => {
              setPresence(false);

              startGame();
            }}
          >
            {(!gameLoadStates.gameStage || !gameLoadStates.gameSocket) && (
              <Fragment>
                <m.div
                  className="flex flex-row text-5xl"
                  key="start-panel-loading-header"
                  exit={{ opacity: 0 }}
                >
                  {Array.from("nemein").map((letter, index) => (
                    <m.span
                      initial="initial"
                      animate="animate"
                      variants={{
                        /**
                         * Raises y position by 15px and shifts the opacity of
                         * each letter sequentially to create a wave effect
                         */
                        animate: () => ({
                          opacity: [0.25, 1, 0.25],
                          y: [0, -10, 0],
                          transition: {
                            duration: 1,
                            delay: index * 0.2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 1.5,
                          },
                        }),
                      }}
                      key={`start-panel-loading-${index}`}
                    >
                      {letter}
                    </m.span>
                  ))}
                </m.div>
              </Fragment>
            )}
          </AnimatePresence>
        ) : (
          /**
           * We don't care about the exit animation handling here because the
           * loading header will directly replace it. Until then, this acts as
           * a placeholder for the loading header.
           */
          <m.div
            className="text-5xl"
            id="start-panel-static-header"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            onAnimationComplete={() =>
              updateGameLoadStates({ initialLoad: false })
            }
          >
            nemein
          </m.div>
        )}
        <AnimatePresence onExitComplete={() => null}>
          {!gameLoadStates.gameRequest && (
            /**
             * The enter animation sequence offsets the components -10px
             * vertically then slide them down with the spring effect for a more
             * lifelike effect. A delays of 0.05 second is added between each
             * components to create the enter order:
             *
             *   static header > start button > options button
             *
             * The exit order is reversed:
             *
             *   options button > start button > static/loading header
             */
            <Fragment>
              <m.button
                className={`${buttonVariants({
                  variant: "default",
                })} place-self-center`}
                key="start-panel-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.05, type: "spring" },
                }}
                exit={{ opacity: 0, transition: { delay: 0.05 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateGameLoadStates({ gameRequest: true })}
                type="button"
              >
                Play
              </m.button>
              <m.div
                className="place-self-center"
                key="start-panel-options"
                initial={{ opacity: 0, y: -10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.1, type: "spring" },
                }}
                exit={{ opacity: 0 }}
              >
                <OptionsPanel />
              </m.div>
            </Fragment>
          )}
        </AnimatePresence>
      </div>
    )
  );
}
