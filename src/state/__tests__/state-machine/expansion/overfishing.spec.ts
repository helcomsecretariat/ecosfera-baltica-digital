import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { filter, find, without } from "lodash";
import { removeOne } from "@/lib/utils";

test("discarding market with fish", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  const marketDeckFish = find(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, marketDeckFish);
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "fish",
  ).slice(0, 3);
  stateBefore.animalMarket.table.push(marketDeckFish);

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.animalMarket.table).not.toContain(marketDeckFish);
  expect(state.animalMarket.deck).toContain(marketDeckFish);
  expect(state.animalMarket.table).toHaveLength(4);
});

test("discarding market with fish when deck is empty", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  const marketDeckFish = find(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.table = [marketDeckFish];
  stateBefore.animalMarket.deck = [];

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.animalMarket.table).not.toContain(marketDeckFish);
  expect(state.animalMarket.deck).toContain(marketDeckFish);
  expect(state.animalMarket.table).toHaveLength(0);
});

test("discarding market with fish when deck is partially empty", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  const marketDeckFish = filter(stateBefore.animalMarket.deck, { faunaType: "fish" }).slice(0, 3);
  const marketDeckNonFish = filter(
    stateBefore.animalMarket.deck,
    (marketDeckCard) => marketDeckCard.faunaType !== "fish",
  );
  stateBefore.animalMarket.table = [...marketDeckNonFish.slice(0, 2), ...marketDeckFish];
  stateBefore.animalMarket.deck = marketDeckNonFish.slice(2, 3);

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  for (const fishCard of marketDeckFish) {
    expect(state.animalMarket.table).not.toContain(fishCard);
    expect(state.animalMarket.deck).toContain(fishCard);
  }
  expect(state.animalMarket.table).toHaveLength(3);
});

test("discarding market without fish", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "fish",
  ).slice(0, 4);

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.animalMarket.table).toStrictEqual(stateBefore.animalMarket.table);
});

test("discarding singleplayer with fish", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
  });
  const stateBefore = getState();
  const marketDeckFish = find(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, marketDeckFish);
  stateBefore.players[0].hand = [marketDeckFish];

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].hand).toHaveLength(1);
  expect(state.players[0].discard).toContain(marketDeckFish);
});

test("discarding multiplayer with fish", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  const marketDeckFish = filter(stateBefore.animalMarket.deck, { faunaType: "fish" }).slice(0, 4);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...marketDeckFish);
  stateBefore.players.forEach((player, index) => {
    player.hand = [marketDeckFish[index]];
  });

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].hand).toHaveLength(1); // Special card remains
  for (const [index, fishCard] of marketDeckFish.entries()) {
    expect(state.players[index].discard).toContain(fishCard);
  }
  expect(state.players.slice(1).every((player) => player.hand.length === 0)).toBe(true);
});

test("discarding singleplayer without fish", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
  });
  const stateBefore = getState();
  const marketDeckNonFish = find(
    stateBefore.animalMarket.deck,
    (marketDeckCard) => marketDeckCard.faunaType !== "fish",
  )!;
  stateBefore.players[0].hand = [marketDeckNonFish];

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].hand).toHaveLength(2); // Special card + non-fish card
  expect(state.players[0].hand).toContain(marketDeckNonFish);
});

test("discarding multiplayer without fish", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  const marketDeckNonFish = filter(stateBefore.animalMarket.deck, { faunaType: "bird" }).slice(0, 4);
  const specialCard = removeOne(stateBefore.plantMarket.deck, ({ abilities }) => abilities.includes("special"))!;
  stateBefore.players[0].hand = [specialCard];

  stateBefore.players.forEach((player, index) => {
    player.hand.push(marketDeckNonFish[index]);
  });

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  const state = getState();
  expect(state.players[0].hand).toHaveLength(2);
  for (const [index, nonFishCard] of marketDeckNonFish.entries()) {
    expect(state.players[index].hand).toContain(nonFishCard);
  }
});