import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { cloneDeep } from "lodash";
test("does not block abilities for the current turn", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });

  activatePolicy({
    policyName: "Underwater noise",
  });

  const state = getState();
  expect(state.blockers.ability.isBlocked).toBe(false);
  expect(state.blockers.ability.reasons).toHaveLength(0);
  expect(state.blockers.ability.reasons).toEqual([]);
});

test("blocks abilities for the next turn", () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });

  const stateBefore = getState();
  stateBefore.turn.boughtPlant = true;

  activatePolicy({ policyName: "Underwater noise", stateBefore });
  send({ type: "user.click.player.endTurn" });

  const state = getState();
  const underwaterNoiseCard = state.policyMarket.active.find((c) => c.name === "Underwater noise")!;
  expect(state.blockers.ability.isBlocked).toBe(true);
  expect(state.blockers.ability.reasons).not.toHaveLength(0);
  expect(state.blockers.ability.reasons).toEqual([underwaterNoiseCard.uid]);
});

test("removes card after single active turn", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });

  const stateBefore = getState();
  stateBefore.turn.boughtPlant = true;

  activatePolicy({ policyName: "Underwater noise", stateBefore });

  send({ type: "user.click.player.endTurn" });

  const stateAfterFirstTurn = cloneDeep(getState());
  stateAfterFirstTurn.turn.boughtPlant = true;

  send({
    type: "iddqd",
    context: stateAfterFirstTurn,
  });

  send({ type: "user.click.player.endTurn" });

  const stateAfterTwoTurns = getState();
  const underwaterNoiseCard = stateAfterTwoTurns.policyMarket.active.find((c) => c.name === "Underwater noise")!;
  expect(stateAfterTwoTurns.blockers.ability.isBlocked).toBe(false);
  expect(stateAfterTwoTurns.blockers.ability.reasons).toEqual([]);
  expect(stateAfterTwoTurns.policyMarket.active).toEqual([]);
  expect(stateAfterTwoTurns.policyMarket.table).toEqual([]);
  expect(stateAfterTwoTurns.policyMarket.deck).not.toContain(underwaterNoiseCard);
});
