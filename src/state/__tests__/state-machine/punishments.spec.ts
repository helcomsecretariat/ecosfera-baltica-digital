import { getTestActor } from "@/state/__tests__/utils";
import { chain, without } from "lodash";
import { test, expect } from "vitest";

test("three suns will get you a disaster card", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();
  const sunCards = chain(stateBefore.elementMarket.deck).filter({ name: "sun" }).take(3).value();
  const token = stateBefore.players[0].abilities.find(({ name }) => name === "plus")!;

  send({
    type: "iddqd",
    context: {
      elementMarket: {
        ...stateBefore.elementMarket,
        deck: without(stateBefore.elementMarket.deck, ...sunCards),
      },
      players: [
        {
          ...stateBefore.players[0],
          hand: [sunCards[0], sunCards[1]],
          deck: [sunCards[2]],
        },
        ...stateBefore.players.slice(1),
      ],
    },
  });

  send({ type: "user.click.token", token });
  expect(getState().players[0].hand.length).toBe(4);
  expect(getState().players[0].hand[3].type).toBe("disaster");
});

test("three disasters => +1 ext. tile & end turn", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();
  const disasterCards = chain(stateBefore.disasterMarket.deck).take(3).value();

  send({
    type: "iddqd",
    context: {
      disasterMarket: {
        ...stateBefore.disasterMarket,
        deck: without(stateBefore.disasterMarket.deck, ...disasterCards),
      },
      players: [
        {
          ...stateBefore.players[0],
          hand: [disasterCards[0], disasterCards[1]],
          deck: [disasterCards[2]],
        },
        ...stateBefore.players.slice(1),
      ],
    },
  });

  const plusToken = stateBefore.players[0].abilities.find(({ name }) => name === "plus")!;
  send({ type: "user.click.token", token: plusToken });
  expect(getState().stage?.eventType).toBe("extinction");
  send({ type: "user.click.stage.confirm" });

  const stateAfter = getState();
  expect(stateAfter.extinctMarket.table.length).toBe(1);
  expect(stateAfter.turn.player).not.toBe(stateBefore.turn.player);
});
