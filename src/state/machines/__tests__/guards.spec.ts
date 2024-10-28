import { describe, it, expect, beforeEach } from "vitest";
import {
  animal_idotea,
  animal_mergus,
  animal_pusa,
  gameState as gameStateMock,
  plant_ascophyllym,
  plant_bacteria,
  plant_nodularia,
} from "@/state/machines/__tests__/state-mock";
import { TurnMachineGuards } from "@/state/machines/guards";
import { cloneDeep } from "lodash-es";
import { AnimalCard, Card, GameState } from "@/state/types";

let gameState: GameState;
describe("BuyMachineGuards", () => {
  beforeEach(() => {
    gameState = cloneDeep(gameStateMock);
  });

  describe("canBuyCard", () => {
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
      it(`should return ${expected} when hand is [${hand.map((card) => card.uid).join(", ")}], played is [${played.join(", ")}], and animal is ${animal.uid}`, () => {
        gameState.players[0].hand = hand;
        gameState.turn.playedCards = played;
        const result = TurnMachineGuards.canBuyCard({ context: gameState }, animal);
        expect(result).toBe(expected);
      });
    }

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
});
