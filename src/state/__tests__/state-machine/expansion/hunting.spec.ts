import { expect, test } from "vitest";
import { getTestActor } from "../../utils";
import { concat, filter, find } from "lodash";

test("removing birds from hand", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const birds = filter(stateBefore.animalMarket.deck, { faunaType: "bird" });
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, birds);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.abilities.includes("special") && animalDeckCard.faunaType !== "bird",
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hunting" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(state.players[0].hand).toHaveLength(5);
});

test("removing mammals from hand", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const mammals = filter(stateBefore.animalMarket.deck, { faunaType: "mammal" });
  stateBefore.players[0].hand = [...mammals];

  const specialCard = find(stateBefore.plantMarket.deck, (plantMarketCard) =>
    plantMarketCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hunting" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
});

test("removing birds and mammals from hand", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const birds = filter(stateBefore.animalMarket.deck, { faunaType: "bird" });
  const mammals = filter(stateBefore.animalMarket.deck, { faunaType: "mammal" });
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, [...birds, ...mammals]);

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) =>
      animalDeckCard.abilities.includes("special") &&
      animalDeckCard.faunaType !== "bird" &&
      animalDeckCard.faunaType !== "mammal",
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hunting" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
  expect(state.players[0].hand).toHaveLength(5);
});

test("removing when hand contains no birds or mammals", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  const specialCard = find(
    stateBefore.animalMarket.deck,
    (animalDeckCard) =>
      animalDeckCard.abilities.includes("special") &&
      animalDeckCard.faunaType !== "bird" &&
      animalDeckCard.faunaType !== "mammal",
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hunting" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(5);
});
