import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";

testRandomSeed("restores single ability in singleplayer", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  stateBefore.players[0].abilities[0].isUsed = true;

  activatePolicy({
    policyName: "Bubble curtains",
    stateBefore,
    specialCardSource: "plants",
  });

  const state = getState();
  expect(state.players[0].abilities.every((ability) => !ability.isUsed)).toBe(true);
});

testRandomSeed("restores abilities after using special abilities", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  activatePolicy({
    policyName: "Bubble curtains",
    stateBefore,
    specialCardSource: "plants",
  });

  const state = getState();
  expect(state.players[0].abilities.every((ability) => !ability.isUsed)).toBe(true);
});

testRandomSeed("restores all abilities in singleplayer", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  stateBefore.players[0].abilities = stateBefore.players[0].abilities.map((ability) => ({
    ...ability,
    isUsed: true,
  }));

  activatePolicy({
    policyName: "Bubble curtains",
    stateBefore,
    specialCardSource: "plants",
  });

  const state = getState();
  expect(state.players[0].abilities.every((ability) => !ability.isUsed)).toBe(true);
});

testRandomSeed("restores abilities in multiplayer", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    seed,
  });
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => ({
    ...player,
    abilities: player.abilities.map((ability) => ({ ...ability, isUsed: true })),
  }));

  activatePolicy({
    policyName: "Bubble curtains",
    stateBefore,
    specialCardSource: "plants",
  });

  const state = getState();
  for (const player of state.players) {
    expect(player.abilities.every((ability) => !ability.isUsed)).toBe(true);
  }
});
