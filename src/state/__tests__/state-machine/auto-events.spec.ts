import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { remove, without } from "lodash";

test("stage game win when all habitats are acquired", async () => {
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

test("stage game loss when extinction table is full", async () => {
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

test("stage mass extinction when player has 4 disaster cards", async () => {
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

test("not trigger same check twice in one turn", async () => {
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

test("punish next player for 3 temperature cards at turn start", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  // Get three temperature cards
  const temperatureCards = stateBefore.elementMarket.deck.filter((card) => card.name === "temperature").slice(0, 3);

  send({
    type: "iddqd",
    context: {
      elementMarket: {
        ...stateBefore.elementMarket,
        deck: without(stateBefore.elementMarket.deck, ...temperatureCards),
      },
      players: [
        stateBefore.players[0],
        {
          ...stateBefore.players[1],
          hand: [...temperatureCards],
        },
        ...stateBefore.players.slice(2),
      ],
      turn: {
        ...stateBefore.turn,
        boughtAnimal: true,
      },
    },
  });

  send({ type: "user.click.player.endTurn" });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("elementalDisaster");
  expect(stateAfter.stage?.cause?.length).toBe(3);

  send({ type: "user.click.stage.confirm" });
  expect(getState().players[0].uid).toBe(stateBefore.players[0].uid);
});

test("punish next player for 3 disaster cards at turn start", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  // Get three disaster cards
  const disasterCards = stateBefore.disasterMarket.deck.slice(0, 3);

  send({
    type: "iddqd",
    context: {
      disasterMarket: {
        ...stateBefore.disasterMarket,
        deck: without(stateBefore.disasterMarket.deck, ...disasterCards),
      },
      players: [
        stateBefore.players[0],
        {
          ...stateBefore.players[1],
          hand: [...disasterCards],
        },
        ...stateBefore.players.slice(2),
      ],
      turn: {
        ...stateBefore.turn,
        boughtAnimal: true,
      },
    },
  });

  send({ type: "user.click.player.endTurn" });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("extinction");
  expect(stateAfter.stage?.cause?.length).toBe(3);

  send({ type: "user.click.stage.confirm" });
  expect(getState().players[0].uid).toBe(stateBefore.players[0].uid);
});

test("punish next player for 4 disaster cards at turn start", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  // Get four disaster cards
  const disasterCards = stateBefore.disasterMarket.deck.slice(0, 4);

  send({
    type: "iddqd",
    context: {
      disasterMarket: {
        ...stateBefore.disasterMarket,
        deck: without(stateBefore.disasterMarket.deck, ...disasterCards),
      },
      players: [
        stateBefore.players[0],
        {
          ...stateBefore.players[1],
          hand: [...disasterCards],
        },
        ...stateBefore.players.slice(2),
      ],
      turn: {
        ...stateBefore.turn,
        boughtAnimal: true,
      },
    },
  });

  send({ type: "user.click.player.endTurn" });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("massExtinction");
  expect(stateAfter.stage?.cause?.length).toBe(4);

  send({ type: "user.click.stage.confirm" });
  expect(getState().extinctMarket.table.length).toBe(3);
  expect(getState().players[0].uid).toBe(stateBefore.players[0].uid);
});

test("unlocking habitat should open policy card when expansion is active", () => {
  const { getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();

  const animalsWithSharedHabitat = remove(stateBefore.animalMarket.deck, (card) => card.habitats.includes("rock"));
  stateBefore.players[0].hand = [...animalsWithSharedHabitat];

  send({ type: "user.click.player.hand.card", card: animalsWithSharedHabitat[0] });
  send({ type: "user.click.player.hand.card", card: animalsWithSharedHabitat[1] });

  send({ type: "user.click.stage.confirm" });

  const stateAfter = getState();
  expect(stateAfter.habitatMarket.deck.find((habitatTile) => habitatTile.name === "rock")?.isAcquired).toBe(true);
  expect(["policy_automaticPolicyDrawHabitat", "policy_automaticFundingIncreaseHabitat"]).toContain(
    stateAfter.stage?.eventType,
  );
});

test("unlocking habitat should not open policy card when expansion is inactive", () => {
  const { getState, send } = getTestActor();
  const stateBefore = getState();

  const animalsWithSharedHabitat = remove(stateBefore.animalMarket.deck, (card) => card.habitats.includes("rock"));
  stateBefore.players[0].hand = [...animalsWithSharedHabitat];

  send({ type: "user.click.player.hand.card", card: animalsWithSharedHabitat[0] });
  send({ type: "user.click.player.hand.card", card: animalsWithSharedHabitat[1] });

  send({ type: "user.click.stage.confirm" });

  const stateAfter = getState();
  expect(stateAfter.habitatMarket.deck.find((habitatTile) => habitatTile.name === "rock")?.isAcquired).toBe(true);
  expect(stateAfter.stage).toBeUndefined();
});
