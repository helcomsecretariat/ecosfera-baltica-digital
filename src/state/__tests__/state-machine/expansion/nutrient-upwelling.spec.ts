import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { filter } from "lodash";

test("distributes two elements in singplayer", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
  });
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name !== "nutrients",
  ).slice(0, 4);

  activatePolicy({
    policyName: "Nutrient upwelling and internal nutrient cycling",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(2);
  expect(filter(state.players[0].hand, { name: "nutrients" })).toHaveLength(2);
});

test("partially distributes elements in singplayer", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
  });
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name !== "nutrients",
  ).slice(0, 4);
  stateBefore.elementMarket.deck = [
    ...filter(stateBefore.elementMarket.deck, (card) => card.name !== "nutrients"),
    ...filter(stateBefore.elementMarket.deck, { name: "nutrients" }).slice(0, 1),
  ];

  activatePolicy({
    policyName: "Nutrient upwelling and internal nutrient cycling",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(1);
  expect(filter(state.players[0].hand, { name: "nutrients" })).toHaveLength(1);
  expect(filter(state.elementMarket.deck, { name: "nutrients" })).toHaveLength(0);
});

test("distributes two elements in multiplayer", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    difficulty: 1,
  });
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => {
    return {
      ...player,
      hand: filter([...player.deck, ...player.hand], (card) => card.name !== "nutrients").slice(0, 4),
    };
  });

  activatePolicy({
    policyName: "Nutrient upwelling and internal nutrient cycling",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(8);
  expect(state.players.every((player) => filter(player.hand, { name: "nutrients" }).length === 2)).toBe(true);
});

test("partially distributes elements in multiplayer", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => {
    return {
      ...player,
      hand: filter([...player.deck, ...player.hand], (card) => card.name !== "nutrients").slice(0, 4),
    };
  });
  stateBefore.elementMarket.deck = [
    ...filter(stateBefore.elementMarket.deck, (card) => card.name !== "nutrients"),
    ...filter(stateBefore.elementMarket.deck, { name: "nutrients" }).slice(0, 4),
  ];

  activatePolicy({
    policyName: "Nutrient upwelling and internal nutrient cycling",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(4);
  expect(state.players.every((player) => filter(player.hand, { name: "nutrients" }).length === 1)).toBe(true);
});

test("no distribution with empty deck", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => {
    return {
      ...player,
      hand: filter([...player.deck, ...player.hand], (card) => card.name !== "nutrients").slice(0, 4),
    };
  });
  stateBefore.elementMarket.deck = [...filter(stateBefore.elementMarket.deck, (card) => card.name !== "nutrients")];

  activatePolicy({
    policyName: "Nutrient upwelling and internal nutrient cycling",
    stateBefore,
  });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(0);
  expect(state.players.every((player) => filter(player.hand, { name: "nutrients" }).length === 0)).toBe(true);
});
