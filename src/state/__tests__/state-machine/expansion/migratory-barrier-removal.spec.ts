import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { without } from "lodash";

testRandomSeed("moving bird to self", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  const deckBirds = stateBefore.animalMarket.deck.filter((card) => card.faunaType === "bird").slice(0, 4);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...deckBirds);
  stateBefore.animalMarket.table = deckBirds;
  const targetBird = stateBefore.animalMarket.table[0];

  activatePolicy({
    policyName: "Migratory barrier removal",
    stateBefore,
    specialCardSource: "plants",
  });
  send({ type: "user.click.market.table.card", card: targetBird });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const state = getState();
  expect(state.animalMarket.table.includes(targetBird)).toBe(false);
  expect(state.animalMarket.table).toHaveLength(4);
  expect(stateBefore.animalMarket.deck.length - state.animalMarket.deck.length).toBe(1);
  expect(state.players[0].hand.includes(targetBird)).toBe(true);
  expect(state.players[0].hand).toHaveLength(7);
});

testRandomSeed("moving bird to other player", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  const deckBirds = stateBefore.animalMarket.deck.filter((card) => card.faunaType === "bird").slice(0, 4);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...deckBirds);
  stateBefore.animalMarket.table = deckBirds;
  const targetBird = stateBefore.animalMarket.table[0];

  activatePolicy({
    policyName: "Migratory barrier removal",
    stateBefore,
    specialCardSource: "plants",
  });
  send({ type: "user.click.market.table.card", card: targetBird });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[1].hand[0] });

  const state = getState();
  expect(state.animalMarket.table.includes(targetBird)).toBe(false);
  expect(state.animalMarket.table).toHaveLength(4);
  expect(stateBefore.animalMarket.deck.length - state.animalMarket.deck.length).toBe(1);
  expect(state.players[1].hand.includes(targetBird)).toBe(true);
  expect(state.players[1].hand).toHaveLength(5);
});

testRandomSeed("moving fish to self", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  const deckFish = stateBefore.animalMarket.deck.filter((card) => card.faunaType === "fish").slice(0, 4);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...deckFish);
  stateBefore.animalMarket.table = deckFish;
  const targetFish = stateBefore.animalMarket.table[0];

  activatePolicy({
    policyName: "Migratory barrier removal",
    stateBefore,
    specialCardSource: "plants",
  });
  send({ type: "user.click.market.table.card", card: targetFish });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const state = getState();
  expect(state.animalMarket.table.includes(targetFish)).toBe(false);
  expect(state.animalMarket.table).toHaveLength(4);
  expect(stateBefore.animalMarket.deck.length - state.animalMarket.deck.length).toBe(1);
  expect(state.players[0].hand.includes(targetFish)).toBe(true);
  expect(state.players[0].hand).toHaveLength(7);
});

testRandomSeed("moving fish to other player", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  const deckFish = stateBefore.animalMarket.deck.filter((card) => card.faunaType === "fish").slice(0, 4);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...deckFish);
  stateBefore.animalMarket.table = deckFish;
  const targetFish = stateBefore.animalMarket.table[0];

  activatePolicy({
    policyName: "Migratory barrier removal",
    stateBefore,
    specialCardSource: "plants",
  });
  send({ type: "user.click.market.table.card", card: targetFish });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[1].hand[0] });

  const state = getState();
  expect(state.commandBar).toBeUndefined();
  expect(state.animalMarket.table.includes(targetFish)).toBe(false);
  expect(state.animalMarket.table).toHaveLength(4);
  expect(stateBefore.animalMarket.deck.length - state.animalMarket.deck.length).toBe(1);
  expect(state.players[1].hand.includes(targetFish)).toBe(true);
  expect(state.players[1].hand).toHaveLength(5);
});
