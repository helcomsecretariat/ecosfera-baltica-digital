import { uniqBy } from "lodash-es";
import {
  AnimalCard,
  Card,
  Coordinate,
  DisasterCard,
  ElementCard,
  GameState,
  PlantCard,
  GamePieceTransforms,
  UiState,
} from "./types";
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
import { cardHeight } from "@/constants/card";

export const toUiState = (prevUiState: UiState | null, gameState: GameState): UiState => {
  return {
    cardPositions: calculateCardPositions(prevUiState, gameState),
    deckPositions: calculateDeckPositions(gameState),
  };
};

const calculateCardPositions = (prevUiState: UiState | null, gameState: GameState): GamePieceTransforms => {
  return {
    ...drawAnimalCards(prevUiState, gameState),
    ...drawPlantCards(gameState),
    ...drawElementCards(gameState),
    ...drawDisasterCards(gameState),
    ...drawPlayerCards(prevUiState, gameState),
  };
};

const calculateDeckPositions = (gameState: GameState): GamePieceTransforms => {
  return {
    animalDeck: {
      position: animalDeckPosition,
      initialPosition: animalDeckPosition,
      rotation: { x: 0, y: 0, z: 0 },
    },
    plantDeck: {
      position: plantDeckPosition,
      initialPosition: plantDeckPosition,
      rotation: { x: 0, y: 0, z: 0 },
    },
    disasterDeck: {
      position: disasterDeckPosition,
      initialPosition: disasterDeckPosition,
      rotation: { x: 0, y: 0, z: 0 },
    },
    ...drawElementDecks(gameState),
  };
};

const getSupplyDeckOffset = (playerHand: Card[]) => {
  return (playerHand.length <= 3 ? 2 : Math.floor((playerHand.length + 1) / 2)) * cardXOffset;
};

export const animalDeckPosition: Coordinate = { x: marketXStart, y: marketYStart, z: 0 };
export const plantDeckPosition: Coordinate = { x: marketXStart, y: marketYStart - cardYOffset, z: 0 };
export const disasterDeckPosition: Coordinate = {
  x: marketXStart - cardXOffset,
  y: marketYStart - 2 * cardYOffset,
  z: 0,
};

export const supplyDeckPositions = (gameState: GameState): Coordinate[] => {
  const positions: Coordinate[] = [];

  if (gameState.players.length > 0) {
    positions.push({ x: 0 - getSupplyDeckOffset(gameState.players[0].hand), y: playerCardsYStart, z: 0 });
  }

  if (gameState.players.length > 1) {
    positions.push({ x: upperXBoundary - cardHeight / 2, y: 0 - getSupplyDeckOffset(gameState.players[1].hand), z: 0 });
  }

  if (gameState.players.length > 2) {
    positions.push({ x: 0 + getSupplyDeckOffset(gameState.players[2].hand), y: upperYBoundary - cardHeight / 2, z: 0 });
  }

  if (gameState.players.length > 3) {
    positions.push({ x: lowerXBoundary + cardHeight / 2, y: 0 + getSupplyDeckOffset(gameState.players[3].hand), z: 0 });
  }

  return positions;
};

export const drawAnimalCards = (prevUiState: UiState | null, gameState: GameState): GamePieceTransforms =>
  gameState.animalMarket.table.reduce((acc, card: AnimalCard, index: number) => {
    acc[card.uid] = {
      position: { x: marketXStart + (index + 1) * cardXOffset, y: marketYStart, z: 0 },
      initialPosition: prevUiState?.cardPositions[card.uid]?.position ?? animalDeckPosition,
      rotation: { x: 0, y: 0, z: 0 },
    };
    return acc;
  }, {} as GamePieceTransforms);

export const drawPlantCards = (gameState: GameState): GamePieceTransforms =>
  gameState.plantMarket.table.reduce((acc, card: PlantCard, index: number) => {
    acc[card.uid] = {
      position: {
        x: marketXStart + (index + 1) * cardXOffset,
        y: marketYStart - cardYOffset,
        z: 0,
      },
      initialPosition: {
        x: plantDeckPosition.x,
        y: plantDeckPosition.y,
        z: plantDeckPosition.z,
      },
      rotation: { x: 0, y: 0, z: 0 },
    };
    return acc;
  }, {} as GamePieceTransforms);

export const drawElementCards = (gameState: GameState): GamePieceTransforms =>
  gameState.elementMarket.table.reduce((acc, card: ElementCard) => {
    acc[card.uid] = {
      position: {
        x: marketXStart + 5 * cardXOffset,
        y: marketYStart - 2 * cardYOffset,
        z: 0,
      },
      initialPosition: {
        x: drawElementDecks(gameState)[`${card.name}ElementDeck`]?.position.x ?? 0,
        y: drawElementDecks(gameState)[`${card.name}ElementDeck`]?.position.y ?? 0,
        z: 0,
      },
      rotation: { x: 0, y: 0, z: 0 },
    };
    return acc;
  }, {} as GamePieceTransforms);

export const drawDisasterCards = (gameState: GameState): GamePieceTransforms =>
  gameState.disasterMarket.table.reduce((acc, card: DisasterCard) => {
    acc[card.uid] = {
      position: {
        x: marketXStart - 2 * cardXOffset,
        y: marketYStart - 2 * cardYOffset,
        z: 0,
      },
      initialPosition: { x: disasterDeckPosition.x, y: disasterDeckPosition.y, z: disasterDeckPosition.z },
      rotation: { x: 0, y: 0, z: 0 },
    };
    return acc;
  }, {} as GamePieceTransforms);

export const drawElementDecks2 = (gameState: GameState) => {
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

export const drawElementDecks = (gameState: GameState): GamePieceTransforms => {
  return uniqBy(gameState.elementMarket.deck, "name")
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, card: ElementCard, index: number) => {
      acc[`${card.name}ElementDeck`] = {
        position: {
          x: marketXStart + index * cardXOffset,
          y: marketYStart - 2 * cardYOffset,
          z: 0,
        },
        initialPosition: {
          x: marketXStart + index * cardXOffset,
          y: marketYStart - 2 * cardYOffset,
          z: 0,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
      };
      return acc;
    }, {} as GamePieceTransforms);
};

export const drawPlayerCards = (prevUiState: UiState | null, gameState: GameState): GamePieceTransforms => {
  return gameState.players.reduce((acc, player, playerIndex) => {
    player.hand.forEach((card: Card, cardIndex: number) => {
      const basePosition = supplyDeckPositions(gameState)[playerIndex];
      acc[card.uid] = {
        position: {
          x:
            basePosition.x +
            (playerIndex === 0
              ? (cardIndex + 1) * cardXOffset
              : playerIndex === 2
                ? (cardIndex + 1) * cardXOffset * -1
                : 0),
          y:
            basePosition.y +
            (playerIndex === 1
              ? (cardIndex + 1) * cardXOffset
              : playerIndex === 3
                ? (cardIndex + 1) * cardXOffset * -1
                : 0),
          z: 0,
        },
        initialPosition: prevUiState?.cardPositions[card.uid]?.position ?? basePosition,
        rotation: { x: 0, y: 0, z: playerIndex * (Math.PI / 2) },
      };
    });
    return acc;
  }, {} as GamePieceTransforms);
};
