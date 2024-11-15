import { describe, it, expect } from "vitest";
import {
  animal_idotea,
  animal_mergus,
  animal_pusa,
  gameState as gameStateMock,
  nutrients_1,
  oxygen_1,
  plant_ascophyllym,
  plant_bacteria,
  plant_nodularia,
  salinity_1,
  salinity_2,
  sun_1,
  temperature_1,
  temperature_2,
  temperature_3,
} from "@/state/__tests__/state-mock";
import { TurnMachineGuards } from "@/state/machines/guards";
import { cloneDeep, map } from "lodash-es";
import { AnimalCard, Card, ElementCard, PlantCard } from "@/state/types";

function testAnimalBuyCase({
  hand,
  played,
  animal,
  expected,
}: {
  hand: Card[];
  played: Card["uid"][];
  animal: AnimalCard;
  expected: boolean;
}) {
  it(`should return ${expected} when 
    \t- hand: ${map(hand, "uid")},
    \t- played: ${played},
    \t- animal: ${animal.name}`, () => {
    const gameState = cloneDeep(gameStateMock);
    gameState.players[0].hand = hand;
    gameState.turn.playedCards = played;
    const result = TurnMachineGuards.canBuyCard({ context: gameState }, animal);
    expect(result).toBe(expected);
  });
}

function testPlantBuyCase({
  hand,
  played,
  plant,
  borrowed,
  expected,
}: {
  hand: Card[];
  played: Card["uid"][];
  plant: PlantCard;
  borrowed: ElementCard;
  expected: boolean;
}) {
  it(`should return ${expected} when 
    \t- hand: ${map(hand, "uid")},
    \t- played: ${played},
    \t- borrowed: ${borrowed.uid},
    \t- plant: ${plant.name}`, () => {
    if (hand.includes(borrowed)) throw new Error("Borrowed element should not be in hand");
    const gameState = cloneDeep(gameStateMock);
    gameState.players[0].hand = hand;
    gameState.turn.playedCards = played;
    gameState.turn.borrowedElement = borrowed;
    const result = TurnMachineGuards.canBuyCard({ context: gameState }, plant);
    expect(result).toBe(expected);
  });
}
describe("buy guards", () => {
  describe("canBuyCard animals", () => {
    const animalBuyCases = [
      {
        hand: [plant_bacteria, plant_nodularia],
        played: [plant_bacteria.uid, plant_nodularia.uid],
        animal: animal_mergus,
        expected: true,
      },
      {
        hand: [plant_bacteria, plant_nodularia],
        played: [plant_bacteria.uid, plant_nodularia.uid],
        animal: animal_pusa,
        expected: true,
      },
      {
        hand: [plant_bacteria, plant_nodularia],
        played: [plant_bacteria.uid, plant_nodularia.uid],
        animal: animal_idotea,
        expected: false,
      },
      {
        hand: [plant_bacteria, plant_ascophyllym],
        played: [plant_bacteria.uid, plant_ascophyllym.uid],
        animal: animal_pusa,
        expected: false,
      },
    ];

    animalBuyCases.forEach(testAnimalBuyCase);
  });

  describe("canBuyCard plants", () => {
    const plantBuyCases = [
      {
        hand: [sun_1, nutrients_1, temperature_1],
        played: [temperature_1.uid, nutrients_1.uid],
        borrowed: temperature_2,
        plant: plant_bacteria,
        expected: true,
      },
      {
        hand: [sun_1, nutrients_1, temperature_1],
        played: [nutrients_1.uid],
        borrowed: temperature_2,
        plant: plant_bacteria,
        expected: false,
      },
      {
        hand: [sun_1, oxygen_1, salinity_1],
        played: [sun_1.uid, oxygen_1.uid],
        borrowed: salinity_2,
        plant: plant_ascophyllym,
        expected: false,
      },
      {
        hand: [sun_1, nutrients_1, temperature_1, temperature_2],
        played: [temperature_1.uid, nutrients_1.uid],
        borrowed: temperature_3,
        plant: plant_bacteria,
        expected: false,
      },
    ];

    plantBuyCases.forEach(testPlantBuyCase);
  });
});
