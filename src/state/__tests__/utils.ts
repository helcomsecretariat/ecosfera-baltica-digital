import { TurnMachine, TurnMachineContext } from "@/state/machines/turn";
import { vi } from "vitest";
import { createActor, EventFromLogic } from "xstate";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";
import { Card } from "@/state/types";

export function getTestActor(input?: Partial<TurnMachineContext>, useSpecialCards?: boolean, playerCount?: number) {
  const actor = createActor(TurnMachine, {
    input: {
      deckConfig: deckConfig as unknown as DeckConfig,
      gameConfig: {
        playerCount: playerCount ?? 2,
        seed: "42",
        difficulty: 3,
        playersPosition: "around",
        useSpecialCards: useSpecialCards ?? false,
        playerNames: ["", ""],
      },
      animSpeed: 1000,
      ...input,
    },
  });
  vi.useFakeTimers();
  actor.start();
  vi.advanceTimersByTime(10000);
  vi.useRealTimers();

  const wrappedSend = async (event: EventFromLogic<typeof TurnMachine>) => {
    vi.useFakeTimers();
    actor.send(event);
    // let state machine proceed all delayed transitions
    vi.advanceTimersByTime(10000);
    vi.useRealTimers();
  };

  const can = (event: EventFromLogic<typeof TurnMachine>) => {
    const snapshot = actor.getSnapshot();
    return snapshot.can(event);
  };

  return {
    send: wrappedSend,
    can,
    actor,
    getState: () => actor.getSnapshot().context,
    logState: () => {
      const snap = actor.getSnapshot();
      snap.context.ui = undefined;
      console.log(JSON.stringify(snap, null, 0));
    },
  };
}

export function compareCards(cardA: Card, cardB: Card) {
  return cardA.uid.localeCompare(cardB.uid);
}
