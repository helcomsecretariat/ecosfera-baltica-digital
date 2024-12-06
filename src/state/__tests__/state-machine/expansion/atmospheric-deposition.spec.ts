import { expect, test } from "vitest";
import { activatePolicy, getTestActor } from "../../utils";
import { filter, find } from "lodash";

test("removing calanoida from animal table", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.name !== "Calanoida",
  ).slice(0, 3);
  stateBefore.animalMarket.table.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();

  expect(calanoida).toBeDefined();
  expect(state.animalMarket.table.includes(calanoida)).toBe(false);
  expect(state.animalMarket.table).toHaveLength(4);
});

test("removing calanoida from animal deck", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.animalMarket.deck.includes(calanoida)).toBe(false);
});

test("removing calanoida from player hand", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[0].hand.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[0].hand.includes(calanoida)).toBe(false);
});

test("removing calanoida from player deck", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[0].deck.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[0].deck.includes(calanoida)).toBe(false);
});

test("removing calanoida from player discard", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[0].discard.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[0].discard.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer cards", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].hand.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].hand.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer hand", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].hand.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].hand.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer deck", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].deck.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].deck.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer discard", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].discard.push(calanoida);

  activatePolicy(stateBefore, send, "Atmospheric deposition of hazardous substances");

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].discard.includes(calanoida)).toBe(false);
});
