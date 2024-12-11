import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { filter, first, without } from "lodash";

testRandomSeed("no disaster cards in hand", async (seed) => {
  const { getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  stateBefore.players[0].deck = [...stateBefore.players[0].hand, ...stateBefore.players[0].deck].filter(
    (card) => card.type !== "disaster",
  );
  const playerHandBefore = (stateBefore.players[0].hand = stateBefore.players[0].deck.slice(0, 4));
  stateBefore.players[0].deck = without(stateBefore.players[0].deck, ...playerHandBefore);

  activatePolicy({
    policyName: "Recycling and waste disposal",
    stateBefore,
  });

  const state = getState();
  expect(state.commandBar).toBeUndefined();
  expect(playerHandBefore.every((card) => state.players[0].hand.includes(card))).toBe(true);
  expect(state.players[0].hand).toHaveLength(6);
});

testRandomSeed("cant select non disaster card", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  stateBefore.players[0].deck = [...stateBefore.players[0].hand, ...stateBefore.players[0].deck];
  const playerHandBefore = (stateBefore.players[0].hand = [
    ...stateBefore.players[0].deck.filter((card) => card.type !== "disaster").slice(0, 3),
    ...stateBefore.players[0].deck.filter((card) => card.type === "disaster").slice(0, 1),
  ]);
  stateBefore.players[0].deck = without(stateBefore.players[0].deck, ...playerHandBefore);

  activatePolicy({
    policyName: "Recycling and waste disposal",
    stateBefore,
  });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const state = getState();
  expect(state.commandBar).toBeDefined();
  expect(playerHandBefore.every((card) => state.players[0].hand.includes(card))).toBe(true);
  expect(state.players[0].hand).toHaveLength(6);
});

testRandomSeed("single disaster card in hand", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  stateBefore.players[0].deck = [...stateBefore.players[0].hand, ...stateBefore.players[0].deck];
  stateBefore.players[0].hand = [
    ...stateBefore.players[0].deck.filter((card) => card.type !== "disaster").slice(0, 3),
    ...stateBefore.players[0].deck.filter((card) => card.type === "disaster").slice(0, 1),
  ];
  stateBefore.players[0].deck = without(stateBefore.players[0].deck, ...stateBefore.players[0].hand);
  stateBefore.players[0].deck = stateBefore.players[0].deck.filter((card) => card.type !== "disaster");

  activatePolicy({
    policyName: "Recycling and waste disposal",
    stateBefore,
  });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[3] });

  const state = getState();
  expect(state.commandBar).toBeUndefined();
  expect(state.players[0].hand.filter((card) => card.type === "disaster")).toHaveLength(0);
  expect(state.players[0].hand).toHaveLength(6);
});

testRandomSeed("multiple disaster cards in hand", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  stateBefore.players[0].deck = [...stateBefore.players[0].hand, ...stateBefore.players[0].deck];
  stateBefore.players[0].hand = [
    ...stateBefore.players[0].deck.filter((card) => card.type !== "disaster").slice(0, 2),
    ...stateBefore.players[0].deck.filter((card) => card.type === "disaster").slice(0, 2),
  ];
  stateBefore.players[0].deck = without(stateBefore.players[0].deck, ...stateBefore.players[0].hand);
  stateBefore.players[0].deck = stateBefore.players[0].deck.filter((card) => card.type !== "disaster");

  activatePolicy({
    policyName: "Recycling and waste disposal",
    stateBefore,
  });

  send({
    type: "user.click.player.hand.card",
    card: first(filter(stateBefore.players[0].hand, { type: "disaster" }))!,
  });

  let state = getState();
  expect(state.commandBar).toBeDefined();

  send({
    type: "user.click.player.hand.card",
    card: first(filter(state.players[0].hand, { type: "disaster" }))!,
  });

  state = getState();
  expect(state.commandBar).toBeUndefined();
  expect(state.players[0].hand.filter((card) => card.type === "disaster")).toHaveLength(0);
  expect(state.players[0].hand).toHaveLength(6);
});

testRandomSeed("multiple disaster cards in hand and deck is empty", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  stateBefore.players[0].deck = [...stateBefore.players[0].hand, ...stateBefore.players[0].deck];
  stateBefore.players[0].hand = [
    ...stateBefore.players[0].deck.filter((card) => card.type !== "disaster").slice(0, 2),
    ...stateBefore.players[0].deck.filter((card) => card.type === "disaster").slice(0, 2),
  ];
  stateBefore.players[0].deck = without(stateBefore.players[0].deck, ...stateBefore.players[0].hand);
  stateBefore.players[0].deck = stateBefore.players[0].deck.filter((card) => card.type !== "disaster");
  stateBefore.players[0].discard = stateBefore.players[0].deck;
  stateBefore.players[0].deck = [];

  activatePolicy({
    policyName: "Recycling and waste disposal",
    stateBefore,
  });

  send({
    type: "user.click.player.hand.card",
    card: first(filter(stateBefore.players[0].hand, { type: "disaster" }))!,
  });

  let state = getState();
  expect(state.commandBar).toBeDefined();

  send({
    type: "user.click.player.hand.card",
    card: first(filter(state.players[0].hand, { type: "disaster" }))!,
  });

  state = getState();
  expect(state.commandBar).toBeUndefined();
  expect(state.players[0].hand.filter((card) => card.type === "disaster")).toHaveLength(0);
  expect(state.players[0].hand).toHaveLength(6);
});

testRandomSeed("multiple disaster cards in other players' hands", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 4, seed });
  const stateBefore = getState();

  stateBefore.players.forEach((player, index) => {
    player.deck = [...player.hand, ...player.deck].filter((card) => card.type !== "disaster");
    if (index === 0 || index === 1) {
      player.hand = [...player.deck.slice(0, 3), stateBefore.disasterMarket.deck[index]];
    } else {
      player.hand = player.deck.slice(0, 4);
    }
  });

  activatePolicy({
    policyName: "Recycling and waste disposal",
    stateBefore,
  });

  send({
    type: "user.click.player.hand.card",
    card: first(filter(stateBefore.players[0].hand, { type: "disaster" }))!,
  });

  let state = getState();
  expect(state.commandBar).toBeDefined();

  send({
    type: "user.click.player.hand.card",
    card: first(filter(state.players[1].hand, { type: "disaster" }))!,
  });

  state = getState();
  expect(state.commandBar).toBeUndefined();

  state.players.forEach((player, index) => {
    expect(player.hand.filter((card) => card.type === "disaster")).toHaveLength(0);
    expect(player.hand).toHaveLength(index === 0 ? 6 : 4);
  });
});

testRandomSeed("blocks cancel after first remove", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  stateBefore.players[0].deck = [...stateBefore.players[0].hand, ...stateBefore.players[0].deck];
  stateBefore.players[0].hand = [
    ...stateBefore.players[0].deck.filter((card) => card.type !== "disaster").slice(0, 2),
    ...stateBefore.players[0].deck.filter((card) => card.type === "disaster").slice(0, 2),
  ];
  stateBefore.players[0].deck = without(stateBefore.players[0].deck, ...stateBefore.players[0].hand);
  stateBefore.players[0].deck = stateBefore.players[0].deck.filter((card) => card.type !== "disaster");

  activatePolicy({
    policyName: "Recycling and waste disposal",
    stateBefore,
  });

  send({
    type: "user.click.player.hand.card",
    card: first(filter(stateBefore.players[0].hand, { type: "disaster" }))!,
  });

  let state = getState();
  expect(state.commandBar).toBeDefined();

  send({ type: "user.click.policies.cancel" });

  state = getState();
  expect(state.commandBar).toBeDefined();
});
