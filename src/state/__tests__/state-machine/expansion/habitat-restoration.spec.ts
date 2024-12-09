import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { without } from "lodash";

testRandomSeed("restoring extinction tile", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  const extinctionTile = stateBefore.extinctMarket.deck[0];
  stateBefore.extinctMarket.deck = without(stateBefore.extinctMarket.deck, extinctionTile);
  stateBefore.extinctMarket.table = [...stateBefore.extinctMarket.table, extinctionTile];

  activatePolicy({
    policyName: "Habitat restoration",
    stateBefore,
  });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(state.extinctMarket.deck).toHaveLength(6);
  expect(state.extinctMarket.table).toHaveLength(0);
});
