import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { without } from "lodash";

test("should stage game win when all habitats are acquired", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  send({
    type: "iddqd",
    context: {
      habitatMarket: {
        ...stateBefore.habitatMarket,
        deck: stateBefore.habitatMarket.deck.map((habitat) => ({
          ...habitat,
          isAcquired: true,
        })),
      },
    },
  });

  // trigger state machine to check for conditions
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("gameWin");
  expect(stateAfter.stage?.terminationEvent).toBe(true);
});

test("should stage game loss when extinction table is full", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  send({
    type: "iddqd",
    context: {
      extinctMarket: {
        ...stateBefore.extinctMarket,
        deck: [],
        table: [...stateBefore.extinctMarket.deck],
      },
    },
  });

  // trigger state machine to check for conditions
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("gameLoss");
  expect(stateAfter.stage?.terminationEvent).toBe(true);
});

test("should stage mass extinction when player has 4 disaster cards", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  // Get three disaster cards
  const disasterCards = stateBefore.disasterMarket.deck.slice(0, 4);

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
          hand: [...disasterCards],
        },
        ...stateBefore.players.slice(1),
      ],
    },
  });

  expect(getState().extinctMarket.table.length).toBe(0);

  // trigger state machine to check for conditions
  send({ type: "user.click.player.hand.card", card: getState().players[0].hand[0] });
  expect(getState().stage?.eventType).toBe("massExtinction");
  expect(getState().stage?.cause?.length).toBe(4);
  send({ type: "user.click.stage.confirm" });
  expect(getState().extinctMarket.table.length).toBe(3);
});

test("should not trigger same check twice in one turn", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  // Setup a state that would trigger elemental disaster
  const temperatureCards = stateBefore.elementMarket.deck.filter((card) => card.name === "temperature").slice(0, 3);

  send({
    type: "iddqd",
    context: {
      elementMarket: {
        ...stateBefore.elementMarket,
        deck: without(stateBefore.elementMarket.deck, ...temperatureCards),
      },
      players: [
        {
          ...stateBefore.players[0],
          hand: [...temperatureCards],
        },
        ...stateBefore.players.slice(1),
      ],
      turn: {
        ...stateBefore.turn,
        automaticEventChecks: ["elementalDisasterCheck"],
      },
    },
  });

  // trigger state machine to check for conditions
  send({ type: "user.click.player.hand.card", card: getState().players[0].hand[0] });
  expect(getState().stage?.eventType).not.toBe("elementalDisaster");
});