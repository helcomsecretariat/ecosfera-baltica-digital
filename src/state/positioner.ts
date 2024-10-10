import { uniqBy } from "lodash-es";
import {
  AnimalCard,
  Card,
  Coordinate,
  DisasterCard,
  ElementCard,
  GameState,
  PlantCard,
  GamePieceAppearances,
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
import { BuyMachineGuards } from "./machines/guards/buy";

const getTurnState = (gameState: GameState) => {
  const isRefreshing = gameState.turn.currentAbility?.name === "refresh";
  const isMoving = gameState.turn.currentAbility?.name === "move";
  const isPlussing = gameState.turn.currentAbility?.name === "plus";
  const hasBorrowed = gameState.turn.borrowedElement;

  return {
    player: gameState.turn.player,
    isPlaying: gameState.turn.playedCards.length > 0,
    isUsingAbility: isRefreshing || isMoving || isPlussing,
    isMoving,
    isPlussing,
    isRefreshing,
    hasBorrowed,
  };
};

export const toUiState = (prevUiState: UiState | null, gameState: GameState): UiState => {
  return {
    cardPositions: calculateCardPositions(gameState, prevUiState),
    deckPositions: calculateDeckPositions(gameState, prevUiState),
  };
};

const calculateCardPositions = (gameState: GameState, prevUiState: UiState | null): GamePieceAppearances => {
  return {
    ...positionAnimalCards(gameState, prevUiState),
    ...positionPlantCards(gameState),
    ...positionElementCards(gameState),
    ...positionDisasterCards(gameState),
    ...positionPlayerCards(gameState, prevUiState),
  };
};

const calculateDeckPositions = (gameState: GameState, prevUiState: UiState | null): GamePieceAppearances => {
  const turnState = getTurnState(gameState);
  return {
    animalDeck: {
      transform: {
        position: animalDeckPosition,
        initialPosition: animalDeckPosition,
        rotation: { x: 0, y: 0, z: 0 },
      },
      display: {
        visibility: turnState.isPlaying
          ? "dimmed"
          : turnState.isUsingAbility
            ? turnState.isRefreshing
              ? "highlighted"
              : turnState.isMoving
                ? "default"
                : "dimmed"
            : "default",
      },
    },
    plantDeck: {
      transform: {
        position: plantDeckPosition,
        initialPosition: plantDeckPosition,
        rotation: { x: 0, y: 0, z: 0 },
      },
      display: {
        visibility: turnState.isPlaying
          ? "dimmed"
          : turnState.isUsingAbility
            ? turnState.isRefreshing
              ? "highlighted"
              : turnState.isMoving
                ? "default"
                : "dimmed"
            : "default",
      },
    },
    disasterDeck: {
      transform: {
        position: disasterDeckPosition,
        initialPosition: disasterDeckPosition,
        rotation: { x: 0, y: 0, z: 0 },
      },
      display: {
        visibility: turnState.isPlaying ? "dimmed" : turnState.isUsingAbility ? "dimmed" : "default",
      },
    },
    ...positionElementDecks(gameState),
    ...positionPlayerDecks(gameState, prevUiState),
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

export const positionAnimalCards = (gameState: GameState, prevUiState: UiState | null): GamePieceAppearances => {
  const turnState = getTurnState(gameState);
  return gameState.animalMarket.table.reduce((acc, card: AnimalCard, index: number) => {
    acc[card.uid] = {
      transform: {
        position: {
          x: marketXStart + (index + 1) * cardXOffset,
          y: marketYStart,
          z: 0 + +BuyMachineGuards.canBuyCard({ context: gameState }, card) * 0.1,
        },
        initialPosition: prevUiState?.cardPositions[card.uid]?.transform?.position ?? animalDeckPosition,
        rotation: { x: 0, y: 0, z: 0 },
      },
      display: {
        visibility: turnState.isPlaying
          ? BuyMachineGuards.canBuyCard({ context: gameState }, card)
            ? "highlighted"
            : "dimmed"
          : turnState.isUsingAbility
            ? "dimmed"
            : "default",
      },
    };
    return acc;
  }, {} as GamePieceAppearances);
};

export const positionPlantCards = (gameState: GameState): GamePieceAppearances => {
  const turnState = getTurnState(gameState);
  return gameState.plantMarket.table.reduce((acc, card: PlantCard, index: number) => {
    acc[card.uid] = {
      transform: {
        position: {
          x: marketXStart + (index + 1) * cardXOffset,
          y: marketYStart - cardYOffset,
          z: 0 + +BuyMachineGuards.canBuyCard({ context: gameState }, card) * 0.1,
        },
        initialPosition: {
          x: plantDeckPosition.x,
          y: plantDeckPosition.y,
          z: plantDeckPosition.z,
        },
        rotation: { x: 0, y: 0, z: 0 },
      },
      display: {
        visibility: turnState.isPlaying
          ? BuyMachineGuards.canBuyCard({ context: gameState }, card)
            ? "highlighted"
            : "dimmed"
          : turnState.isUsingAbility
            ? "dimmed"
            : "default",
      },
    };

    return acc;
  }, {} as GamePieceAppearances);
};

export const positionElementCards = (gameState: GameState): GamePieceAppearances =>
  ([gameState.turn.borrowedElement, ...gameState.elementMarket.table].filter(Boolean) as ElementCard[]).reduce(
    (acc, card: ElementCard) => {
      acc[card.uid] = {
        transform: {
          position: {
            x: marketXStart + 5 * cardXOffset,
            y: marketYStart - 2 * cardYOffset,
            z: 0,
          },
          initialPosition: {
            x: positionElementDecks(gameState)[`${card.name}ElementDeck`]?.transform.position.x ?? 0,
            y: positionElementDecks(gameState)[`${card.name}ElementDeck`]?.transform.position.y ?? 0,
            z: 0,
          },
          exitPosition: {
            x: positionElementDecks(gameState)[`${card.name}ElementDeck`]?.transform.position.x ?? 0,
            y: positionElementDecks(gameState)[`${card.name}ElementDeck`]?.transform.position.y ?? 0,
            z: 0,
          },
          rotation: { x: 0, y: 0, z: 0 },
        },
      };
      return acc;
    },
    {} as GamePieceAppearances,
  );

export const positionDisasterCards = (gameState: GameState): GamePieceAppearances =>
  gameState.disasterMarket.table.reduce((acc, card: DisasterCard) => {
    acc[card.uid] = {
      transform: {
        position: {
          x: marketXStart - 2 * cardXOffset,
          y: marketYStart - 2 * cardYOffset,
          z: 0,
        },
        initialPosition: { x: disasterDeckPosition.x, y: disasterDeckPosition.y, z: disasterDeckPosition.z },
        rotation: { x: 0, y: 0, z: 0 },
      },
    };
    return acc;
  }, {} as GamePieceAppearances);

export const positionElementDecks = (gameState: GameState): GamePieceAppearances => {
  const turnState = getTurnState(gameState);
  return uniqBy(gameState.elementMarket.deck, "name")
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, card: ElementCard, index: number) => {
      acc[`${card.name}ElementDeck`] = {
        transform: {
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
        },
        display: {
          visibility: turnState.isUsingAbility
            ? turnState.isMoving
              ? "default"
              : "dimmed"
            : turnState.hasBorrowed
              ? "dimmed"
              : "default",
        },
      };
      return acc;
    }, {} as GamePieceAppearances);
};

export const positionPlayerDecks = (gameState: GameState, prevUiState: UiState | null): GamePieceAppearances => {
  const turnState = getTurnState(gameState);
  return gameState.players.reduce((acc, player, playerIndex) => {
    acc[`${player.uid}PlayerDeck`] = {
      transform: {
        position: {
          x: supplyDeckPositions(gameState)[playerIndex].x,
          y: supplyDeckPositions(gameState)[playerIndex].y,
          z: supplyDeckPositions(gameState)[playerIndex].z,
        },
        initialPosition:
          prevUiState?.deckPositions[`${player.uid}PlayerDeck`]?.transform.position ??
          supplyDeckPositions(gameState)[playerIndex],
        rotation: {
          x: 0,
          y: 0,
          z: playerIndex * (Math.PI / 2),
        },
      },
      display: {
        visibility: turnState.isUsingAbility
          ? turnState.isPlussing && turnState.player === player.uid
            ? "highlighted"
            : "dimmed"
          : "default",
      },
    };
    return acc;
  }, {} as GamePieceAppearances);
};

export const positionPlayerCards = (gameState: GameState, prevUiState: UiState | null): GamePieceAppearances => {
  console.log(gameState.players);
  const turnState = getTurnState(gameState);
  return gameState.players.reduce((acc, player, playerIndex) => {
    const basePosition = supplyDeckPositions(gameState)[playerIndex];
    const rotation = { x: 0, y: 0, z: playerIndex * (Math.PI / 2) };
    const { playedCards, exhaustedCards } = gameState.turn;

    player.hand
      .filter((card) => !exhaustedCards.includes(card.uid))
      .forEach((card: Card, cardIndex: number) => {
        const inPlay = playedCards.includes(card.uid);
        const exhausted = exhaustedCards.includes(card.uid);
        const offset = getPlayerCardOffset(
          playerIndex,
          cardIndex,
          player.hand.length,
          inPlay,
          exhausted,
          turnState.player === player.uid,
        );

        acc[card.uid] = {
          transform: {
            position: {
              x: basePosition.x + offset.x,
              y: basePosition.y + offset.y,
              z: 0,
            },
            initialPosition: prevUiState?.cardPositions[card.uid]?.transform.position ?? basePosition,
            exitPosition: basePosition,
            rotation,
            initialRotation: rotation,
            exitRotation: rotation,
          },
          display: {
            visibility: turnState.isUsingAbility
              ? turnState.isMoving && turnState.player === player.uid
                ? "highlighted"
                : "dimmed"
              : "default",
          },
        };
      });

    player.hand
      .filter((card) => exhaustedCards.includes(card.uid))
      .forEach((card: Card, cardIndex: number) => {
        const inPlay = playedCards.includes(card.uid);
        const exhausted = exhaustedCards.includes(card.uid);
        const offset = getPlayerCardOffset(
          playerIndex,
          cardIndex,
          player.hand.length - exhaustedCards.length,
          inPlay,
          exhausted,
          turnState.player === player.uid,
        );

        acc[card.uid] = {
          transform: {
            position: {
              x: basePosition.x + offset.x,
              y: basePosition.y + offset.y,
              z: 0,
            },
            initialPosition: prevUiState?.cardPositions[card.uid]?.transform.position ?? basePosition,
            exitPosition: basePosition,
            rotation,
            initialRotation: rotation,
            exitRotation: rotation,
          },
          display: {
            visibility: "dimmed",
          },
        };
      });

    return acc;
  }, {} as GamePieceAppearances);
};

const getPlayerCardOffset = (
  playerIndex: number,
  cardIndex: number,
  handLength: number,
  inPlay: boolean,
  exhausted: boolean,
  activePlayer: boolean,
) => {
  const indexOffset = activePlayer ? 1 : 0.5;
  const cardOffset = exhausted
    ? (handLength + 1) * cardXOffset + (cardIndex + indexOffset) * cardXOffset
    : (cardIndex + indexOffset) * cardXOffset;
  const inPlayOffset = inPlay ? (playerIndex === 0 || playerIndex === 3 ? 4 : -4) : 0;

  switch (playerIndex) {
    case 0:
      return { x: cardOffset, y: inPlayOffset };
    case 1:
      return { x: inPlayOffset, y: cardOffset };
    case 2:
      return { x: -cardOffset, y: inPlayOffset };
    case 3:
      return { x: inPlayOffset, y: -cardOffset };
    default:
      return { x: 0, y: 0 };
  }
};
