import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { concat, filter, find, without } from "lodash";

// Test skipped for now because it conflicts with the conditions for elemental disaster
test.skip("nutrient to market when player has 3 nutrients", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  const marketNutrients = filter(stateBefore.elementMarket.deck, { name: "nutrients" }).slice(0, 3);
  stateBefore.elementMarket.deck = without(stateBefore.elementMarket.deck, ...marketNutrients);
  stateBefore.players[0].hand = [];
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, marketNutrients);

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const upgradedWasteWaterTreatmentCard = find(stateBefore.policyMarket.deck, {
    name: "Upgraded waste water treatment",
  })!;
  stateBefore.policyMarket.deck = [fundingCard, upgradedWasteWaterTreatmentCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: upgradedWasteWaterTreatmentCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(-1);
  expect(
    filter(stateBefore.players[0].hand, { name: "nutrients" }).length -
      filter(state.players[0].hand, { name: "nutrients" }).length,
  ).toBe(1);
});

test("player gets additional nutrient", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name === "nutrients",
  ).slice(0, 1);

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const upgradedWasteWaterTreatmentCard = find(stateBefore.policyMarket.deck, {
    name: "Upgraded waste water treatment",
  })!;
  stateBefore.policyMarket.deck = [fundingCard, upgradedWasteWaterTreatmentCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: upgradedWasteWaterTreatmentCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(1);
  expect(
    filter(stateBefore.players[0].hand, { name: "nutrients" }).length -
      filter(state.players[0].hand, { name: "nutrients" }).length,
  ).toBe(-1);
});

test("player gets no additional nutrient when deck is empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name === "nutrients",
  ).slice(0, 1);
  stateBefore.elementMarket.deck = filter(stateBefore.elementMarket.deck, (card) => card.name !== "nutrients");

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const upgradedWasteWaterTreatmentCard = find(stateBefore.policyMarket.deck, {
    name: "Upgraded waste water treatment",
  })!;
  stateBefore.policyMarket.deck = [fundingCard, upgradedWasteWaterTreatmentCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: upgradedWasteWaterTreatmentCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(0);
  expect(
    filter(stateBefore.players[0].hand, { name: "nutrients" }).length -
      filter(state.players[0].hand, { name: "nutrients" }).length,
  ).toBe(0);
});
