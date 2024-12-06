import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { without } from "lodash";

test("restoring extinction tile", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
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
