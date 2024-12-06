import { test, expect } from "vitest";
import { activatePolicy, getTestActor } from "@/state/__tests__/utils";
import { without } from "lodash";

test("restoring extinction tile", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  const extinctionTile = stateBefore.extinctMarket.deck[0];
  stateBefore.extinctMarket.deck = without(stateBefore.extinctMarket.deck, extinctionTile);
  stateBefore.extinctMarket.table = [...stateBefore.extinctMarket.table, extinctionTile];

  activatePolicy(stateBefore, send, "Habitat restoration");

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(state.extinctMarket.deck).toHaveLength(6);
  expect(state.extinctMarket.table).toHaveLength(0);
});
