import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import GameStateMachine from "@/state/state-machine";
import config from "@/decks/ecosfera-baltica.deck.json";
import { useMachine } from "@xstate/react";
import { GameState } from "@/state/types";
import { type EventFromLogic } from "xstate";
import { createStateHandlers, StateHandlers } from "@/state/action-handlers";

interface StateProviderProps {
  children: ReactNode;
  numberOfPlayers: number;
  seed: string;
}

interface StateContextType {
  state: GameState;
  send: (e: EventFromLogic<typeof GameStateMachine>) => void;
  handlers: StateHandlers;
}

const stateContext = createContext<StateContextType | undefined>(undefined);

export const GameStateProvider = ({ children, numberOfPlayers, seed }: StateProviderProps) => {
  const [snap, send] = useMachine(GameStateMachine, {
    input: {
      //@ts-expect-error TS can infer enums from JSON files. Deck validation is done in the schema
      config,
      numberOfPlayers,
      seed,
    },
  });
  const handlers = useMemo(() => createStateHandlers(send), [send]);

  const value = {
    state: snap.context,
    send,
    handlers,
  };

  useEffect(() => {
    console.log(handlers);
  }, [handlers]);

  return <stateContext.Provider value={value}>{children}</stateContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(stateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};
