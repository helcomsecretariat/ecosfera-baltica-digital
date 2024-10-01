import { createContext, ReactNode, useContext } from "react";
import GameStateMachine from "@/state/state-machine";
import config from "@/decks/ecosfera-baltica.deck.json";
import { useMachine } from "@xstate/react";
import { GameState } from "@/state/types";
import { type EventFromLogic } from "xstate";

interface stateProviderProps {
  children: ReactNode;
  numberOfPlayers: number;
  seed: string;
}

interface stateContextType {
  state: GameState;
  send: (e: EventFromLogic<typeof GameStateMachine>) => void;
}

const stateContext = createContext<stateContextType | undefined>(undefined);

export const GameStateProvider = ({ children, numberOfPlayers, seed }: stateProviderProps) => {
  const [snap, send] = useMachine(GameStateMachine, {
    input: {
      //@ts-expect-error TS can infer enums from JSON files. Deck validation is done in the schema
      config,
      numberOfPlayers,
      seed,
    },
  });

  return <stateContext.Provider value={{ state: snap.context, send }}>{children}</stateContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(stateContext);
  if (!context) {
    throw new Error("usestate must be used within a stateProvider");
  }
  return context;
};
