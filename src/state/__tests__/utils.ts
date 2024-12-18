import { TurnMachine, TurnMachineContext } from "@/state/machines/turn";
import { test, vi } from "vitest";
import { createActor, EventFromLogic } from "xstate";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";
import { Card, AnimalCard, PlantCard } from "@/state/types";
import { find, filter, without, cloneDeep } from "lodash";
import { names } from "@/state/machines/expansion";
import { generateRandomString, removeOne } from "@/lib/utils";

interface TestActorConfig {
  context?: Partial<TurnMachineContext>;
  useSpecialCards?: boolean;
  playerCount?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5 | 6;
  seed?: string;
}

export function getTestActor({
  context,
  useSpecialCards = false,
  playerCount = 2,
  difficulty = 3,
  seed = "42",
}: TestActorConfig = {}) {
  const actor = createActor(TurnMachine, {
    input: {
      deckConfig: deckConfig as unknown as DeckConfig,
      gameConfig: {
        playerCount: playerCount ?? 2,
        seed: seed,
        difficulty: difficulty ?? 3,
        playersPosition: "around",
        useSpecialCards: useSpecialCards ?? false,
        playerNames: ["", ""],
      },
      animSpeed: 1000,
      ...context,
    },
  });
  vi.useFakeTimers();
  actor.start();
  vi.advanceTimersByTime(10000);
  vi.useRealTimers();

  const send = (event: EventFromLogic<typeof TurnMachine>) => {
    vi.useFakeTimers()!;
    actor.send(event);
    // let state machine proceed all delayed transitions
    vi.advanceTimersByTime(10000);
    vi.useRealTimers();
  };

  const getState = () => actor.getSnapshot().context;

  const logState = () => {
    const snap = actor.getSnapshot();
    snap.context.ui = undefined;
    console.log(JSON.stringify(snap, null, 0));
  };

  const can = (event: EventFromLogic<typeof TurnMachine>) => {
    const snapshot = actor.getSnapshot();
    return snapshot.can(event);
  };

  interface ActivatePolicyConfig {
    policyName: (typeof names)[number];
    stateBefore?: TurnMachineContext;
    specialCardSource?: "animals" | "plants";
    autoConfirmStage?: boolean;
  }

  const activatePolicy = ({
    policyName,
    stateBefore,
    specialCardSource,
    autoConfirmStage = true,
  }: ActivatePolicyConfig) => {
    const state = stateBefore ?? getState();
    const policyCard = find(state.policyMarket.deck, { name: policyName })!;
    const fundingCard = find(state.policyMarket.deck, { name: "Funding" })!;

    if (!policyCard) throw new Error(`Policy card ${policyName} not found`);

    state.policyMarket.deck = without(state.policyMarket.deck, policyCard, fundingCard);
    const originalPolicyMarketDeck = cloneDeep(state.policyMarket.deck);

    //  setup hand
    const specialCardsInHand = filter(state.players[0].hand, (card: PlantCard | AnimalCard) =>
      card.abilities?.includes("special"),
    );
    const neededSpecialCards = policyCard.effect === "positive" ? 2 : 1;
    const cardsToAdd: Card[] = [];

    while (specialCardsInHand.length + cardsToAdd.length < neededSpecialCards) {
      const specialCard = removeOne<AnimalCard | PlantCard>(
        specialCardSource === "plants" ? state.plantMarket.deck : state.animalMarket.deck,
        (card) => card.abilities.includes("special"),
      );

      if (!specialCard) throw new Error(`Special card not found in ${specialCardSource} deck`);

      cardsToAdd.push(specialCard);
    }

    state.players[0].hand = [...state.players[0].hand, ...cardsToAdd];

    // set up policy market
    const targetedPolicyMarketDeck = policyCard.effect === "positive" ? [fundingCard, policyCard] : [policyCard];
    state.policyMarket.deck = [...targetedPolicyMarketDeck, ...originalPolicyMarketDeck];

    send({
      type: "iddqd",
      context: state,
    });

    // play all special cards needed
    const cardsToPlay = filter(state.players[0].hand, (card: PlantCard | AnimalCard) =>
      card.abilities?.includes("special"),
    ).slice(0, neededSpecialCards);

    for (const card of cardsToPlay) {
      send({
        type: "user.click.player.hand.card.token",
        card: card as AnimalCard | PlantCard,
        abilityName: "special",
      });
      if (autoConfirmStage) send({ type: "user.click.stage.confirm" });
    }

    if (policyCard.effect === "positive") {
      send({
        type: "user.click.policy.card.acquired",
        card: policyCard,
      });
      if (autoConfirmStage) send({ type: "user.click.stage.confirm" });
    }
  };

  return {
    send,
    can,
    actor,
    getState,
    logState,
    activatePolicy,
  };
}

export function compareCards(cardA: Card, cardB: Card) {
  return cardA.uid.localeCompare(cardB.uid);
}

export function testRandomSeed(name: string, callback: (seed: string) => void, numRuns: number = 10) {
  return test.concurrent.each([...Array(numRuns).keys()].map(() => ({ seed: generateRandomString(12) })))(
    `${name} (seed: %s)`,
    async ({ seed }) => callback(seed),
  );
}
