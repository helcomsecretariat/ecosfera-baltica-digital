import { createContext, ReactNode, useEffect, useMemo } from "react";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { useMachine } from "@xstate/react";
import { GameConfig, GameState, UiState } from "@/state/types";
import { ActorRefFrom, SnapshotFrom, type EventFromLogic } from "xstate";
import { ActionEmmiters, ActionTesters, createEmmiters, createGuards, createTesters } from "@/state/action-handlers";
import { eventLogger } from "@/state/machines/utils";
import { TurnMachine } from "@/state/machines/turn";
import type { DeckConfig } from "@/decks/schema";
import { useAnimControls } from "@/hooks/useAnimationControls";
import { ContextInjectedGuardMap } from "@/state/machines/guards";

interface StateContextType {
  snap: SnapshotFrom<typeof TurnMachine>;
  actorRef: ActorRefFrom<typeof TurnMachine>;
  state: GameState;
  send: (e: EventFromLogic<typeof TurnMachine>) => void;
  emit: ActionEmmiters;
  test: ActionTesters;
  guards: ContextInjectedGuardMap;
  hasTag: (tag: string) => boolean;
  uiState: UiState;
  gameConfig: GameConfig;
}

export const stateContext = createContext<StateContextType | undefined>(undefined);

export const GameStateProvider = ({
  children,
  playerCount,
  seed,
  difficulty,
  playerNames,
  useSpecialCards,
}: GameConfig & { children: ReactNode }) => {
  const { animSpeed } = useAnimControls();

  const gameConfig: GameConfig = {
    playerCount,
    seed,
    difficulty,
    useSpecialCards,
    playersPosition: "around",
    playerNames,
  };

  const [snap, send, actorRef] = useMachine(TurnMachine, {
    inspect: eventLogger,
    // inspect: xStateInspector,
    input: {
      deckConfig: deckConfig as unknown as DeckConfig,
      gameConfig,
      animSpeed,
    },
  });
  const emit = useMemo(() => createEmmiters(send), [send]);
  const test = useMemo(() => createTesters(snap.can.bind(snap)), [snap]);
  const hasTag = useMemo(() => snap.hasTag.bind(snap), [snap]);

  useEffect(() => {
    emit.iddqd({ animSpeed })();
  }, [animSpeed]);

  const value = {
    snap,
    actorRef,
    state: snap.context,
    uiState: snap.context.ui!,
    send,
    emit,
    test,
    guards: createGuards(snap.context),
    hasTag,
    gameConfig,
  };
  return <stateContext.Provider value={value}>{children}</stateContext.Provider>;
};
