import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { filter, find } from "lodash";

test("discarding market with birds", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const marketDeckBird = find(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "bird",
  ).slice(0, 3);
  stateBefore.animalMarket.table.push(marketDeckBird);

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table).not.toContain(marketDeckBird);
  expect(state.animalMarket.table).toHaveLength(4);
});

test("discarding market with birds when deck is empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const marketDeckBird = find(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.table = [marketDeckBird];

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  stateBefore.animalMarket.deck = [];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table).not.toContain(marketDeckBird);
  expect(state.animalMarket.table).toHaveLength(0);
});

test("discarding market with birds when deck is partially empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const marketDeckBirds = filter(stateBefore.animalMarket.deck, { faunaType: "bird" }).slice(0, 3);
  const marketDeckNonBirds = filter(
    stateBefore.animalMarket.deck,
    (marketDeckCard) => marketDeckCard.faunaType !== "bird",
  );
  stateBefore.animalMarket.table = [...marketDeckNonBirds.slice(0, 2), ...marketDeckBirds];

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  stateBefore.animalMarket.deck = marketDeckNonBirds.slice(2, 3);

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table).not.toContain(marketDeckBirds);
  expect(state.animalMarket.table).toHaveLength(3);
});

test("discarding market without birds", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "bird",
  ).slice(0, 4);

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.animalMarket.table).toHaveLength(4);
});

test("discarding single player with bird", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  const marketDeckBird = find(stateBefore.animalMarket.deck, { faunaType: "bird" })!;

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "bird",
  )!;
  stateBefore.players[0].hand = [];
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.players[0].hand.push(marketDeckBird);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(1);
});

test("discarding multi player with birds", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  const marketDeckBirds = filter(stateBefore.animalMarket.deck, { faunaType: "bird" }).slice(0, 4);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "bird",
  )!;
  stateBefore.players[0].hand = [marketDeckBirds[0], specialCard];

  stateBefore.players.slice(1).map((player, index) => {
    player.hand = [marketDeckBirds[index++]];
  });

  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(1);
  expect(state.players.slice(1).every((player) => player.hand.length === 0)).toBe(true);
});

test("discarding single player without bird", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  const marketDeckNonBird = find(
    stateBefore.animalMarket.deck,
    (marketDeckCard) => marketDeckCard.faunaType !== "bird",
  )!;

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "bird",
  )!;
  stateBefore.players[0].hand = [];
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.players[0].hand.push(marketDeckNonBird);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(2);
});

test("discarding multi player without birds", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  const marketDeckNonBirds = filter(stateBefore.animalMarket.deck, { faunaType: "fish" }).slice(0, 4);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "bird",
  )!;
  stateBefore.players[0].hand = [marketDeckNonBirds[0], specialCard];

  stateBefore.players.slice(1).map((player, index) => {
    player.hand = [marketDeckNonBirds[index++]];
  });

  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Oil spill" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(2);
  expect(state.players.slice(1).every((player) => player.hand.length === 1)).toBe(true);
});
