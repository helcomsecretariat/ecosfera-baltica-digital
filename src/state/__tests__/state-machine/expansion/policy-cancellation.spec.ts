import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "../../utils";
import { without } from "lodash";

testRandomSeed("cancelling policy card should refund", async (seed) => {
  const { activatePolicy, send, getState } = getTestActor({ playerCount: 1, useSpecialCards: true, seed });
  const stateBefore = getState();

  stateBefore.players[0].deck = [...stateBefore.players[0].hand, ...stateBefore.players[0].deck];
  stateBefore.players[0].hand = [
    ...stateBefore.players[0].deck.filter((card) => card.type !== "disaster").slice(0, 3),
    ...stateBefore.players[0].deck.filter((card) => card.type === "disaster").slice(0, 1),
  ];
  stateBefore.players[0].deck = without(stateBefore.players[0].deck, ...stateBefore.players[0].hand);
  stateBefore.players[0].deck = stateBefore.players[0].deck.filter((card) => card.type !== "disaster");

  activatePolicy({ policyName: "Recycling and waste disposal", stateBefore });

  const stateAfter = getState();
  expect(stateAfter.commandBar).toBeDefined();
  expect(stateAfter.policyMarket.funding).toHaveLength(0);
  expect(stateAfter.policyMarket.exhausted).toHaveLength(1);
  expect(stateAfter.policyMarket.active).toHaveLength(1);

  send({ type: "user.click.policies.cancel" });

  const stateAfterCancel = getState();
  expect(stateAfterCancel.commandBar).toBeUndefined();
  expect(stateAfterCancel.policyMarket.funding).toHaveLength(1);
  expect(stateAfterCancel.policyMarket.exhausted).toHaveLength(0);
  expect(stateAfterCancel.policyMarket.active).toHaveLength(0);
});

testRandomSeed("dual effect card with command bar cannot be cancelled", async (seed) => {
  const { activatePolicy, send, getState } = getTestActor({ playerCount: 1, useSpecialCards: true, seed });
  const stateBefore = getState();

  activatePolicy({ policyName: "Green energy", stateBefore });

  const stateAfter = getState();
  expect(stateAfter.commandBar).toBeDefined();
  expect(stateAfter.policyMarket.funding).toHaveLength(0);
  expect(stateAfter.policyMarket.active).toHaveLength(1);

  send({ type: "user.click.policies.cancel" });

  const stateAfterCancel = getState();
  expect(stateAfter.commandBar).toBeDefined();
  expect(stateAfterCancel.policyMarket.funding).toHaveLength(0);
  expect(stateAfterCancel.policyMarket.active).toHaveLength(1);
});
