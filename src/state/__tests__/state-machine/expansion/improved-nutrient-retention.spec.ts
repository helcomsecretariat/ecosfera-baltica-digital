import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
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

testRandomSeed("all plant cards require one less nutrient", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    difficulty: 1,
    seed,
  });
  const stateBefore = getState();
  const plantCardsBefore = getAllPlantCards(stateBefore);

  activatePolicy({
    policyName: "Improved nutrient retention in agriculture",
    stateBefore,
  });

  const state = getState();
  const plantCardsAfter = getAllPlantCards(state);
  expect(plantCardsBefore.length === plantCardsAfter.length).toBe(true);

  plantCardsBefore.forEach((plantCard, index) => {
    const nutrientCountBefore = plantCard.elements.filter((el) => el === "nutrients").length;
    const nutrientCountAfter = plantCardsAfter[index].elements.filter((el) => el === "nutrients").length;

    expect(nutrientCountBefore === 0 || nutrientCountBefore - nutrientCountAfter === 1).toBe(true);
  });
});

testRandomSeed("card stays on table after multiple turns", (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });

  const stateBefore = getState();
  activatePolicy({
    policyName: "Improved nutrient retention in agriculture",
    stateBefore,
  });

  // First turn
  send({ type: "user.click.player.endTurn" });
  send({ type: "user.click.stage.confirm" }); // no buy punishment
  send({ type: "user.click.stage.confirm" }); // three disasters punishment

  const stateAfterFirstTurn = getState();
  expect(stateAfterFirstTurn.policyMarket.table).toHaveLength(1);
  expect(stateAfterFirstTurn.policyMarket.table[0].name).toBe("Improved nutrient retention in agriculture");

  // Second turn
  send({ type: "user.click.player.endTurn" });
  send({ type: "user.click.stage.confirm" }); // no buy punishment
  send({ type: "user.click.stage.confirm" }); // three disasters punishment

  const stateAfterSecondTurn = getState();
  expect(stateAfterSecondTurn.policyMarket.table).toHaveLength(1);
  expect(stateAfterSecondTurn.policyMarket.table[0].name).toBe("Improved nutrient retention in agriculture");
});
