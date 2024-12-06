import { test, expect } from "vitest";
import { activatePolicy, getTestActor } from "@/state/__tests__/utils";

test("discarding plant market", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const tablePlantsBefore = stateBefore.plantMarket.table;

  activatePolicy(stateBefore, send, "Hazardous substances from industry");

  const state = getState();

  for (const plant of tablePlantsBefore) {
    expect(state.plantMarket.deck).toContain(plant);
    expect(state.plantMarket.table).not.toContain(plant);
  }

  for (const tableCard of state.plantMarket.table) {
    expect(state.plantMarket.deck).not.toContain(tableCard);
  }

  expect(state.plantMarket.table).toHaveLength(4);
});

test("discarding plant market when deck is empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const tablePlantsBefore = stateBefore.plantMarket.table;

  stateBefore.plantMarket.deck = [];

  activatePolicy(stateBefore, send, "Hazardous substances from industry");

  const state = getState();

  for (const plant of tablePlantsBefore) {
    expect(state.plantMarket.deck).toContain(plant);
    expect(state.plantMarket.table).not.toContain(plant);
  }

  for (const tableCard of state.plantMarket.table) {
    expect(state.plantMarket.deck).not.toContain(tableCard);
  }

  expect(state.plantMarket.table).toHaveLength(0);
});

test("discarding plant market when deck is partially empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const tablePlantsBefore = stateBefore.plantMarket.table;

  stateBefore.plantMarket.deck = stateBefore.plantMarket.deck.slice(-2);

  activatePolicy(stateBefore, send, "Hazardous substances from industry");

  const state = getState();

  for (const plant of tablePlantsBefore) {
    expect(state.plantMarket.deck).toContain(plant);
    expect(state.plantMarket.table).not.toContain(plant);
  }

  for (const tableCard of state.plantMarket.table) {
    expect(state.plantMarket.deck).not.toContain(tableCard);
  }

  expect(state.plantMarket.table).toHaveLength(2);
});

test("discarding singleplayer with plants", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  const plantCards = stateBefore.plantMarket.table.filter((card) => card.type === "plant");
  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...plantCards];

  activatePolicy(stateBefore, send, "Hazardous substances from industry");

  const state = getState();

  for (const plantCard of plantCards) {
    expect(state.players[0].hand).not.toContain(plantCard);
    expect(state.players[0].discard).toContain(plantCard);
  }

  expect(state.players[0].hand).toHaveLength(5);
});

test("discarding multiplayer with plants", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  const plantCards = stateBefore.plantMarket.table.slice(0, 4);
  stateBefore.players.forEach((player, index) => {
    player.hand.push(plantCards[index]);
  });

  activatePolicy(stateBefore, send, "Hazardous substances from industry");

  const state = getState();

  for (let i = 0; i < state.players.length; i++) {
    if (plantCards[i]) {
      expect(state.players[i].hand).not.toContain(plantCards[i]);
      expect(state.players[i].discard).toContain(plantCards[i]);
    }
  }

  expect(state.players[0].hand).toHaveLength(5);
  expect(state.players.slice(1, 4).every((player) => player.hand.length === 4)).toBe(true);
});

test("discarding singleplayer without plants", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  activatePolicy(stateBefore, send, "Hazardous substances from industry");

  const state = getState();
  expect(state.players[0].hand).toHaveLength(5);
});

test("discarding multiplayer without plants", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();

  activatePolicy(stateBefore, send, "Hazardous substances from industry");

  const state = getState();
  expect(state.players[0].hand).toHaveLength(5);
  expect(state.players.slice(1, 4).every((player) => player.hand.length === 4)).toBe(true);
});
