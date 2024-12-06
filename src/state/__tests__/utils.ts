import { TurnMachine, TurnMachineContext } from "@/state/machines/turn";
import { vi } from "vitest";
import { createActor, EventFromLogic } from "xstate";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";
import { Card, AnimalCard, PlantCard } from "@/state/types";
import { find, filter, without } from "lodash";
import { names } from "@/state/machines/expansion";
import { removeOne } from "@/lib/utils";

export function getTestActor(
  input?: Partial<TurnMachineContext>,
  useSpecialCards?: boolean,
  playerCount?: number,
  difficulty?: 1 | 2 | 3 | 4 | 5 | 6,
) {
  const actor = createActor(TurnMachine, {
    input: {
      deckConfig: deckConfig as unknown as DeckConfig,
      gameConfig: {
        playerCount: playerCount ?? 2,
        seed: "42",
        difficulty: difficulty ?? 3,
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

export function activatePolicy(
  stateBefore: TurnMachineContext,
  send: (event: EventFromLogic<typeof TurnMachine>) => Promise<void>,
  policyName: (typeof names)[number],
) {
  const policyCard = find(stateBefore.policyMarket.deck, { name: policyName })!;
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  stateBefore.policyMarket.deck = without(stateBefore.policyMarket.deck, policyCard, fundingCard);

  //  setup hand
  const specialCardsInHand = filter(stateBefore.players[0].hand, (card: PlantCard | AnimalCard) =>
    card.abilities?.includes("special"),
  );
  const neededSpecialCards = policyCard.effect === "positive" ? 2 : 1;
  const cardsToAdd: Card[] = [];

  while (specialCardsInHand.length + cardsToAdd.length < neededSpecialCards) {
    const specialCard =
      removeOne(stateBefore.animalMarket.deck, (card) => card.abilities.includes("special")) ??
      removeOne(stateBefore.plantMarket.deck, (card) => card.abilities.includes("special"));

    if (specialCard) cardsToAdd.push(specialCard);
  }

  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...cardsToAdd];

  // set up policy market
  stateBefore.policyMarket.deck = policyCard.effect === "positive" ? [fundingCard, policyCard] : [policyCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  // play all special cards needed
  const cardsToPlay = filter(stateBefore.players[0].hand, (card: PlantCard | AnimalCard) =>
    card.abilities?.includes("special"),
  ).slice(0, neededSpecialCards);
  for (const card of cardsToPlay) {
    send({
      type: "user.click.player.hand.card.token",
      card: card as AnimalCard | PlantCard,
      abilityName: "special",
    });
    send({ type: "user.click.stage.confirm" });
  }

  if (policyCard.effect === "positive") {
    send({
      type: "user.click.policy.card.acquired",
      card: policyCard,
    });
    send({ type: "user.click.stage.confirm" });
  }
}
