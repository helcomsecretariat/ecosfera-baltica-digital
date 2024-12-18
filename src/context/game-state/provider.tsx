import { ReactNode, useEffect, useMemo, useState } from "react";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { useMachine } from "@xstate/react";
import { GameConfig } from "@/state/types";
import { createEmmiters, createGuards, createTesters } from "@/state/action-handlers";
import { eventLogger } from "@/state/machines/utils";
import { TurnMachine } from "@/state/machines/turn";
import type { DeckConfig } from "@/decks/schema";
import { useAnimControls } from "@/hooks/useAnimationControls";
import { stateContext } from "@/context/game-state/context";

export const GameStateProvider = ({
  children,
  playerCount,
  seed,
  difficulty,
  playerNames,
  useSpecialCards,
}: GameConfig & { children: ReactNode }) => {
  const { animSpeed } = useAnimControls();
  const [showPolicies, setShowPolicies] = useState<boolean>(false);

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

  if (snap.error) {
    throw snap.error;
  }

  const emit = useMemo(() => createEmmiters(send), [send]);
  const test = useMemo(() => createTesters(snap.can.bind(snap)), [snap]);
  const hasTag = useMemo(() => snap.hasTag.bind(snap), [snap]);

  useEffect(() => {
    emit.iddqd({ animSpeed })();
  }, [animSpeed]);

  useEffect(() => {
    // TODO looks a bit weird
    // This is so that the policy screen automatically closes when activating a card
    setShowPolicies(false);
  }, [snap.context.policyMarket.active, setShowPolicies]);

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
    showPolicies,
    setShowPolicies,
  };
  return <stateContext.Provider value={value}>{children}</stateContext.Provider>;
};
