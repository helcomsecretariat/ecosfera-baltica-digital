import { test, expect } from "vitest";
import { activatePolicy, getTestActor } from "@/state/__tests__/utils";
import { GameState, PlantCard } from "@/state/types";

const getAllPlantCards = (state: GameState): PlantCard[] => {
  return [
    ...state.plantMarket.deck,
    ...state.plantMarket.table,
    ...state.players.flatMap((player) => [
      ...player.hand.filter((card) => card.type === "plant"),
      ...player.deck.filter((card) => card.type === "plant"),
      ...player.discard.filter((card) => card.type === "plant"),
    ]),
  ];
};

test("all plant cards require one less nutrient", async () => {
  const { send, getState } = getTestActor({}, true, 4, 1);
  const stateBefore = getState();

  const plantCardsBefore = getAllPlantCards(stateBefore);

  activatePolicy(stateBefore, send, "Improved nutrient retention in agriculture");

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  const plantCardsAfter = getAllPlantCards(state);
  expect(plantCardsBefore.length === plantCardsAfter.length).toBe(true);
  plantCardsBefore.forEach((plantCard, index) => {
    const nutrientCountBefore = plantCard.elements.filter((el) => el === "nutrients").length;
    const nutrientCountAfter = plantCardsAfter[index].elements.filter((el) => el === "nutrients").length;

    expect(nutrientCountBefore === 0 || nutrientCountBefore - nutrientCountAfter === 1).toBe(true);
  });
});
