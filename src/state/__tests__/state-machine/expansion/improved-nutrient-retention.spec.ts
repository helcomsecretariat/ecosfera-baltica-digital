import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { concat, filter, find, flatMap } from "lodash";
import { GameState, PlantCard } from "@/state/types";

const getAllPlantCards = (state: GameState): PlantCard[] => {
  return [
    ...state.plantMarket.deck,
    ...state.plantMarket.table,
    ...(filter(
      flatMap(state.players, (player) => player.hand),
      { type: "plant" },
    ) as PlantCard[]),
    ...(filter(
      flatMap(state.players, (player) => player.deck),
      { type: "plant" },
    ) as PlantCard[]),
    ...(filter(
      flatMap(state.players, (player) => player.discard),
      { type: "plant" },
    ) as PlantCard[]),
  ];
};

test("all plant cards require one less nutrient", async () => {
  const { send, getState } = getTestActor({}, true, 4, 1);
  const stateBefore = getState();

  const plantCardsBefore = getAllPlantCards(stateBefore);

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const improvedNutrientRetentionCard = find(stateBefore.policyMarket.deck, {
    name: "Improved nutrient retention in agriculture",
  })!;
  stateBefore.policyMarket.deck = [fundingCard, improvedNutrientRetentionCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: improvedNutrientRetentionCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  const plantCardsAfter = getAllPlantCards(state);
  expect(plantCardsBefore.length === plantCardsAfter.length).toBe(true);
  plantCardsBefore.forEach((plantCard, index) => {
    const nutrientsBefore = plantCard.elements.filter((el) => el === "nutrients").length;
    const nutrientsAfter = plantCardsAfter[index].elements.filter((el) => el === "nutrients").length;

    expect(nutrientsBefore === 0 || nutrientsBefore - nutrientsAfter === 1).toBe(true);
  });
});
