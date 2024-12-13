import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { cloneDeep } from "lodash";
import { expect } from "vitest";

testRandomSeed("should deactivate all player abilities when no measure has been implemented", (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    seed,
  });
  const stateBefore = getState();

  activatePolicy({
    policyName: "Warm summer",
    stateBefore,
  });

  const state = getState();
  expect(stateBefore.players.every((player) => player.abilities.every((ability) => ability.isUsed === false))).toBe(
    true,
  );
  expect(state.players.every((player) => player.abilities.every((ability) => ability.isUsed === true))).toBe(true);
});

testRandomSeed("should reactivate all player abilities when a measure has been implemented", (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    seed,
  });
  const stateBefore = getState();
  const policyDeckCopy = stateBefore.policyMarket.deck;

  stateBefore.players = stateBefore.players.map((player) => {
    return {
      ...player,
      abilities: player.abilities.map((ability) => {
        return {
          ...ability,
          isUsed: true,
        };
      }),
    };
  });

  activatePolicy({
    policyName: "Bubble curtains",
    stateBefore,
    specialCardSource: "plants",
  });

  // Not sure why, but after activating a policy, the new state becomes readonly
  const stateAfterMeasure = cloneDeep(getState());
  stateAfterMeasure.policyMarket.deck = policyDeckCopy;

  activatePolicy({
    policyName: "Warm summer",
    stateBefore: stateAfterMeasure,
    specialCardSource: "plants",
  });

  const state = getState();
  expect(stateBefore.players.every((player) => player.abilities.every((ability) => ability.isUsed === true))).toBe(
    true,
  );
  expect(state.players.every((player) => player.abilities.every((ability) => ability.isUsed === false))).toBe(true);
});
