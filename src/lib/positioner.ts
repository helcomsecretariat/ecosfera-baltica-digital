import { cardHeight } from "@/constants/card";
import {
  cardXOffset,
  cardYOffset,
  lowerXBoundary,
  marketXStart,
  marketYStart,
  playerCardsYStart,
  upperXBoundary,
  upperYBoundary,
} from "@/constants/gameBoard";
import { AnimalCard, DisasterCard, ElementCard, GameState, PlantCard, PositionedCard } from "@/state/types";
import { uniqBy } from "lodash-es";

export const animalDeckPosition: [number, number, number] = [marketXStart, marketYStart, 0];
export const plantDeckPosition: [number, number, number] = [marketXStart, marketYStart - cardYOffset, 0];
export const disasterDeckPosition: [number, number, number] = [
  marketXStart - cardXOffset,
  marketYStart - 2 * cardYOffset,
  0,
];

export const supplyDeckPositions = (gameState: GameState): [number, number, number][] => {
  const positions: [number, number, number][] = [];

  if (gameState.players.length > 0) {
    positions.push([0 - Math.floor((gameState.players[0].hand.length + 1) / 2) * cardXOffset, playerCardsYStart, 0]);
  }

  if (gameState.players.length > 1) {
    positions.push([
      upperXBoundary - cardHeight / 2,
      0 - Math.floor((gameState.players[1].hand.length + 1) / 2) * cardXOffset,
      0,
    ]);
  }

  if (gameState.players.length > 2) {
    positions.push([
      0 + Math.floor((gameState.players[2].hand.length + 1) / 2) * cardXOffset,
      upperYBoundary - cardHeight / 2,
      0,
    ]);
  }

  if (gameState.players.length > 3) {
    positions.push([
      lowerXBoundary + cardHeight / 2,
      0 + Math.floor((gameState.players[3].hand.length + 1) / 2) * cardXOffset,
      0,
    ]);
  }

  return positions;
};

export const drawAnimalCards = (gameState: GameState): PositionedCard[] =>
  gameState.animalMarket.table.map((card: AnimalCard, index: number) => ({
    ...card,
    x: marketXStart + (index + 1) * cardXOffset,
    y: marketYStart,
  }));

export const drawPlantCards = (gameState: GameState): PositionedCard[] =>
  gameState.plantMarket.table.map((card: PlantCard, index: number) => ({
    ...card,
    x: marketXStart + (index + 1) * cardXOffset,
    y: marketYStart - cardYOffset,
  }));

export const drawElementCards = (gameState: GameState): PositionedCard[] =>
  gameState.elementMarket.table.map((card: ElementCard) => ({
    ...card,
    x: marketXStart + 5 * cardXOffset,
    y: marketYStart - 2 * cardYOffset,
  }));

export const drawDisasterCards = (gameState: GameState): PositionedCard[] =>
  gameState.disasterMarket.table.map((card: DisasterCard) => ({
    ...card,
    x: marketXStart - 2 * cardXOffset,
    y: marketYStart - 2 * cardYOffset,
  }));

export const drawElementDecks = (gameState: GameState) => {
  return uniqBy(gameState.elementMarket.deck, "name")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((card, index: number) => {
      return {
        x: marketXStart + index * cardXOffset,
        y: marketYStart - 2 * cardYOffset,
        ...card,
      };
    });
};
