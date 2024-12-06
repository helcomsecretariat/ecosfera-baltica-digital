import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { filter, find, without } from "lodash";
import { removeOne } from "@/lib/utils";

test("discarding market with birds", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  const marketDeckBird = find(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, marketDeckBird);
  stateBefore.animalMarket.table = [
    ...filter(stateBefore.animalMarket.deck, (card) => card.faunaType !== "bird").slice(0, 3),
    marketDeckBird,
  ];
  const tableBefore = [...stateBefore.animalMarket.table];

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.animalMarket.deck).toContain(marketDeckBird);
  expect(state.animalMarket.table).not.toContain(marketDeckBird);
  expect(state.animalMarket.table).toHaveLength(4);

  // Verify non-bird cards remain in table
  for (const card of tableBefore.filter((card) => card.faunaType !== "bird")) {
    expect(state.animalMarket.table).toContain(card);
  }
});

test("discarding market with birds when deck is empty", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  const marketDeckBird = removeOne(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.table = [marketDeckBird];
  stateBefore.animalMarket.deck = [];

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });

  const state = getState();
  expect(state.animalMarket.deck).toContain(marketDeckBird);
  expect(state.animalMarket.table).not.toContain(marketDeckBird);
  expect(state.animalMarket.table).toHaveLength(0);
});

test("discarding market with birds when deck is partially empty", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  const marketDeckBirds = filter(stateBefore.animalMarket.deck, { faunaType: "bird" }).slice(0, 3);
  const marketDeckNonBirds = filter(stateBefore.animalMarket.deck, (card) => card.faunaType !== "bird");

  stateBefore.animalMarket.table = [...marketDeckNonBirds.slice(0, 2), ...marketDeckBirds];
  stateBefore.animalMarket.deck = marketDeckNonBirds.slice(2, 3);
  const tableBefore = [...stateBefore.animalMarket.table];

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();

  // Verify birds are moved to deck
  for (const bird of marketDeckBirds) {
    expect(state.animalMarket.table).not.toContain(bird);
  }

  // Verify non-birds remain in table
  for (const card of tableBefore.filter((card) => card.faunaType !== "bird")) {
    expect(state.animalMarket.table).toContain(card);
  }

  expect(state.animalMarket.table).toHaveLength(3);
});

test("discarding market without birds", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  const nonBirdCards = filter(stateBefore.animalMarket.deck, (card) => card.faunaType !== "bird").slice(0, 4);
  stateBefore.animalMarket.table = nonBirdCards;
  const tableBefore = [...stateBefore.animalMarket.table];

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.animalMarket.table).toEqual(tableBefore);
});

test("discarding singleplayer with bird", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
  });
  const stateBefore = getState();
  const marketDeckBird = find(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, marketDeckBird);
  stateBefore.players[0].hand = [marketDeckBird];

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].hand).toHaveLength(0);
  expect(state.players[0].discard).toContain(marketDeckBird);
});

test("discarding multiplayer with birds", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  const marketDeckBirds = filter(stateBefore.animalMarket.deck, { faunaType: "bird" }).slice(0, 4);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...marketDeckBirds);

  stateBefore.players.forEach((player, index) => {
    player.hand = [marketDeckBirds[index]];
  });

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();

  // Verify each player's bird is discarded
  state.players.forEach((player, index) => {
    const bird = marketDeckBirds[index];
    expect(player.hand).toHaveLength(0);
    expect(player.discard).toContain(bird);
  });
});

test("discarding singleplayer without bird", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
  });
  const stateBefore = getState();
  const nonBirdCard = find(stateBefore.animalMarket.deck, (card) => card.faunaType !== "bird")!;
  stateBefore.players[0].hand = [nonBirdCard];

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].hand).toEqual([nonBirdCard]);
});

test("discarding multiplayer without birds", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  const nonBirdCards = filter(stateBefore.animalMarket.deck, { faunaType: "fish" }).slice(0, 4);

  // prepare special cards
  const specialCard = removeOne(stateBefore.plantMarket.deck, (card) => card.abilities.includes("special"))!;
  stateBefore.players[0].hand.push(specialCard);

  stateBefore.players.forEach((player, index) => {
    player.hand.push(nonBirdCards[index]);
  });

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();

  // Verify each player's non-bird card remains in hand
  state.players.forEach((player, index) => {
    expect(player.hand).toContain(nonBirdCards[index]);
    expect(player.discard).toEqual([]);
  });
});
