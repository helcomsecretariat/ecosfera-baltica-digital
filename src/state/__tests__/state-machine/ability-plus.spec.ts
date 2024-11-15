import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";

test("using plus ability with depleted deck but not discard", async () => {
  const { send, getState } = getTestActor();
  const { players } = getState();

  send({
    type: "iddqd",
    context: {
      players: [
        {
          ...players[0],
          deck: [],
          discard: players[0].deck,
        },
        ...players.slice(1),
      ],
    },
  });

  const stateBefore = getState();
  const token = stateBefore.players[0].abilities.find(({ name }) => name === "plus")!;

  expect(stateBefore.players[0].deck.length).toBe(0);
  expect(stateBefore.players[0].discard.length).toBe(3);
  expect(stateBefore.players[0].hand.length).toBe(4);
  expect(token.isUsed).toBe(false);

  send({ type: "user.click.token", token });

  const newState = getState();
  expect(newState.players[0].deck.length).toBe(2);
  expect(newState.players[0].hand.length).toBe(5);
  expect(newState.turn.currentAbility).toBe(undefined);
  expect(newState.players[0].abilities.find(({ name }) => name === "plus")!.isUsed).toBe(true);
});

test("using plus ability with depleted deck&discard", async () => {
  const { send, getState } = getTestActor();
  const { players } = getState();

  send({
    type: "iddqd",
    context: {
      players: [
        {
          ...players[0],
          deck: [],
          discard: [],
        },
        ...players.slice(1),
      ],
    },
  });

  const stateBefore = getState();
  const token = stateBefore.players[0].abilities.find(({ name }) => name === "plus")!;

  expect(stateBefore.players[0].deck.length).toBe(0);
  expect(stateBefore.players[0].hand.length).toBe(4);
  expect(stateBefore.players[0].abilities.find(({ name }) => name === "plus")!.isUsed).toBe(false);

  await send({ type: "user.click.token", token });

  const stateAfter = getState();
  expect(stateAfter.players[0].deck.length).toBe(0);
  expect(stateAfter.players[0].hand.length).toBe(4);
  expect(stateAfter.turn.currentAbility).toBe(undefined);
  expect(stateAfter.players[0].abilities.find(({ name }) => name === "plus")!.isUsed).toBe(false);
});
