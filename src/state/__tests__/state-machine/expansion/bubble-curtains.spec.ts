import { test, expect } from "vitest";
import { activatePolicy, getTestActor } from "@/state/__tests__/utils";

test("restores single ability in singleplayer", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  stateBefore.players[0].abilities[0].isUsed = true;

  activatePolicy(stateBefore, send, "Bubble curtains");

  const state = getState();
  expect(state.players[0].abilities.every((ability) => !ability.isUsed)).toBe(true);
});

test("restores abilities after using special abilities", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  activatePolicy(stateBefore, send, "Bubble curtains");

  const state = getState();
  expect(state.players[0].abilities.every((ability) => !ability.isUsed)).toBe(true);
});

test("restores all abilities in singleplayer", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  stateBefore.players[0].abilities = stateBefore.players[0].abilities.map((ability) => ({
    ...ability,
    isUsed: true,
  }));

  activatePolicy(stateBefore, send, "Bubble curtains");

  const state = getState();
  expect(state.players[0].abilities.every((ability) => !ability.isUsed)).toBe(true);
});

test("restores abilities in multiplayer", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => ({
    ...player,
    abilities: player.abilities.map((ability) => ({ ...ability, isUsed: true })),
  }));

  activatePolicy(stateBefore, send, "Bubble curtains");

  const state = getState();
  for (const player of state.players) {
    expect(player.abilities.every((ability) => !ability.isUsed)).toBe(true);
  }
});
