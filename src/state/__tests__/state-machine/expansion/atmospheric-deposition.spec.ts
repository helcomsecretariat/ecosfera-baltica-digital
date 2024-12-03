import { expect, test } from "vitest";
import { getTestActor } from "../../utils";
import { filter, find } from "lodash";

test("removing calanoida from animal table", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.animalMarket.table = stateBefore.animalMarket.table.slice(0, 3);
  stateBefore.animalMarket.table.push(calanoida);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType === "fish",
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, {
    name: "Atmospheric deposition of hazardous substances",
  });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(calanoida).toBeDefined();
  expect(state.animalMarket.table.includes(calanoida)).toBe(false);
  expect(state.animalMarket.table).toHaveLength(4);
});

test("removing calanoida from animal deck", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType === "fish",
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, {
    name: "Atmospheric deposition of hazardous substances",
  });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(calanoida).toBeDefined();
  expect(state.animalMarket.deck.includes(calanoida)).toBe(false);
});

test("removing calanoida from singleplayer cards", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[0].hand.push(calanoida);
  stateBefore.players[0].deck.push(calanoida);
  stateBefore.players[0].discard.push(calanoida);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType === "fish",
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, {
    name: "Atmospheric deposition of hazardous substances",
  });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[0].hand.includes(calanoida)).toBe(false);
  expect(state.players[0].deck.includes(calanoida)).toBe(false);
  expect(state.players[0].discard.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer cards", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].hand.push(calanoida);
  stateBefore.players[2].deck.push(calanoida);
  stateBefore.players[2].discard.push(calanoida);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType === "fish",
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, {
    name: "Atmospheric deposition of hazardous substances",
  });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].hand.includes(calanoida)).toBe(false);
  expect(state.players[2].deck.includes(calanoida)).toBe(false);
  expect(state.players[2].discard.includes(calanoida)).toBe(false);
});
