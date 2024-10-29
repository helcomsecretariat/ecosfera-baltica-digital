import { createContext, ReactNode, useContext, useLayoutEffect, useMemo, useRef } from "react";
import config from "@/decks/ecosfera-baltica.deck.json";
import { useMachine } from "@xstate/react";
import { GameConfig, GameState, UiState } from "@/state/types";
import { SnapshotFrom, type EventFromLogic } from "xstate";
import { ActionEmmiters, ActionTesters, createEmmiters, createTesters } from "@/state/action-handlers";
import { inspect } from "@/state/machines/utils";
import { TurnMachine } from "@/state/machines/turn";
import { toUiState } from "@/state/positioner";
import type { DeckConfig } from "@/decks/schema";

interface StateContextType {
  snap: SnapshotFrom<typeof TurnMachine>;
  state: GameState;
  send: (e: EventFromLogic<typeof TurnMachine>) => void;
  emit: ActionEmmiters;
  test: ActionTesters;
  hasTag: (tag: string) => boolean;
  uiState: UiState;
}

const stateContext = createContext<StateContextType | undefined>(undefined);

export const GameStateProvider = ({
  children,
  playerCount,
  seed,
  difficulty,
  playerNames,
}: GameConfig & { children: ReactNode }) => {
  const [snap, send] = useMachine(TurnMachine, {
    inspect,
    input: {
      deckConfig: config as DeckConfig,
      gameConfig: {
        playerCount: playerCount,
        seed,
        difficulty,
        useSpecialCards: false,
        playersPosition: "around",
        playerNames,
      },
    },
  });
  const emit = useMemo(() => createEmmiters(send), [send]);
  const test = useMemo(() => createTesters(snap.can.bind(snap)), [snap]);
  const hasTag = useMemo(() => snap.hasTag.bind(snap), [snap]);
  const prevUiStateRef = useRef<UiState | null>(null);
  const uiState = useMemo(() => toUiState(prevUiStateRef.current, snap.context), [snap.context]);

  useLayoutEffect(() => {
    prevUiStateRef.current = uiState;
  }, [uiState]);

  const value = {
    snap,
    state: snap.context,
    uiState,
    send,
    emit,
    test,
    hasTag,
  };
  return <stateContext.Provider value={value}>{children}</stateContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(stateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};
