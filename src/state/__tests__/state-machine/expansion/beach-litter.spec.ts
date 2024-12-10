import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";

test("does not block turn for the current turn", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });

  activatePolicy({
    policyName: "Beach litter",
  });

  const state = getState();
  expect(state.blockers.turn.isBlocked).toBe(false);
  expect(state.blockers.turn.reasons).toHaveLength(0);
  expect(state.blockers.turn.reasons).toEqual([]);
});

test("blocks next player's turn", () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });

  activatePolicy({ policyName: "Beach litter" });
  send({ type: "user.click.player.endTurn" });
  send({ type: "user.click.stage.confirm" }); // no buy punishment
  send({ type: "user.click.stage.confirm" }); // three disasters punishment

  const state = getState();
  const beachLitterCard = state.policyMarket.active.find((c) => c.name === "Beach litter")!;
  expect(state.blockers.turn.isBlocked).toBe(true);
  expect(state.blockers.turn.reasons).not.toHaveLength(0);
  expect(state.blockers.turn.reasons).toEqual([beachLitterCard.uid]);
});

test("moves card to active player's deck after single active turn", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });

  activatePolicy({ policyName: "Beach litter" });

  send({ type: "user.click.player.endTurn" });
  send({ type: "user.click.stage.confirm" }); // no buy punishment
  send({ type: "user.click.stage.confirm" }); // three disasters punishment

  send({ type: "user.click.player.endTurn" });
  send({ type: "user.click.stage.confirm" }); // no buy punishment
  send({ type: "user.click.stage.confirm" }); // three disasters punishment

  const stateAfterTwoTurns = getState();
  const activePlayer = stateAfterTwoTurns.players.find((p) => p.uid === stateAfterTwoTurns.turn.player)!;

  expect(stateAfterTwoTurns.blockers.turn.isBlocked).toBe(false);
  expect(stateAfterTwoTurns.blockers.turn.reasons).toEqual([]);
  expect(stateAfterTwoTurns.policyMarket.active).toEqual([]);
  expect(stateAfterTwoTurns.policyMarket.table).toEqual([]);

  // Verify card moved to active player's deck
  const beachLitterCard = activePlayer.deck.find((c) => c.name === "Beach litter");
  expect(beachLitterCard).toBeDefined();
});
