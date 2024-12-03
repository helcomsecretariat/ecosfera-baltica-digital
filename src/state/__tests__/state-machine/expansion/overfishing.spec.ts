import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { filter, find, without } from "lodash";

test("discarding market with fish", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const marketDeckFish = find(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, marketDeckFish);
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "fish",
  ).slice(0, 3);
  stateBefore.animalMarket.table.push(marketDeckFish);

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table.includes(marketDeckFish)).toBe(false);
  expect(state.animalMarket.deck.includes(marketDeckFish)).toBe(true);
  expect(state.animalMarket.table).toHaveLength(4);
});

test("discarding market with fish when deck is empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const marketDeckFish = find(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.table = [marketDeckFish];

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  stateBefore.animalMarket.deck = [];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table.includes(marketDeckFish)).toBe(false);
  expect(state.animalMarket.deck.includes(marketDeckFish)).toBe(true);
  expect(state.animalMarket.table).toHaveLength(0);
});

test("discarding market with fish when deck is partially empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const marketDeckFish = filter(stateBefore.animalMarket.deck, { faunaType: "fish" }).slice(0, 3);
  const marketDeckNonFish = filter(
    stateBefore.animalMarket.deck,
    (marketDeckCard) => marketDeckCard.faunaType !== "fish",
  );
  stateBefore.animalMarket.table = [...marketDeckNonFish.slice(0, 2), ...marketDeckFish];

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  stateBefore.animalMarket.deck = marketDeckNonFish.slice(2, 3);

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table.some((animalTableCard) => marketDeckFish.includes(animalTableCard))).toBe(false);
  expect(marketDeckFish.every((marketDeckFishCard) => state.animalMarket.deck.includes(marketDeckFishCard))).toBe(true);
  expect(state.animalMarket.table).toHaveLength(3);
});

test("discarding market without fish", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "fish",
  ).slice(0, 4);

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table).toStrictEqual(stateBefore.animalMarket.table);
});

test("discarding singleplayer with fish", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  const marketDeckFish = find(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, marketDeckFish);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "fish",
  )!;
  stateBefore.players[0].hand = [specialCard, marketDeckFish];
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(1);
  expect(state.players[0].discard.includes(marketDeckFish)).toBe(true);
});

test("discarding multiplayer with fish", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  const marketDeckFish = filter(stateBefore.animalMarket.deck, { faunaType: "fish" }).slice(0, 4);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...marketDeckFish);
  stateBefore.players.forEach((player, index) => {
    player.hand = [marketDeckFish[index]];
  });

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "fish",
  )!;
  stateBefore.players[0].hand.push(specialCard);

  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(1);
  expect(
    marketDeckFish.every((marketDeckFishCard, index) => state.players[index].discard.includes(marketDeckFishCard)),
  ).toBe(true);
  expect(state.players.slice(1).every((player) => player.hand.length === 0)).toBe(true);
});

test("discarding singleplayer without fish", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  const marketDeckNonFish = find(
    stateBefore.animalMarket.deck,
    (marketDeckCard) => marketDeckCard.faunaType !== "fish",
  )!;

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "fish",
  )!;
  stateBefore.players[0].hand = [];
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.players[0].hand.push(marketDeckNonFish);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(2);
  expect(state.players[0].hand.includes(marketDeckNonFish)).toBe(true);
});

test("discarding multiplayer without fish", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  const marketDeckNonFish = filter(stateBefore.animalMarket.deck, { faunaType: "bird" }).slice(0, 4);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "fish",
  )!;
  stateBefore.players[0].hand = [marketDeckNonFish[0], specialCard];

  stateBefore.players.slice(1).map((player, index) => {
    player.hand = [marketDeckNonFish[index++]];
  });

  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Overfishing" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(2);
  expect(
    state.players
      .slice(1)
      .every((player, index) => player.hand.length === 1 && player.hand.includes(marketDeckNonFish[index])),
  ).toBe(true);
});
