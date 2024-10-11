import { uniqBy } from "lodash-es";
import {
  AnimalCard,
  Card,
  Coordinate,
  DisasterCard,
  ElementCard,
  GameState,
  PlantCard,
  GamePieceCoordsDict,
  UiState,
  GamePieceAppearance,
  GamePieceAppearances,
  AbsentPieceTransform,
} from "./types";
import {
  cardXOffset,
  cardYOffset,
  lowerXBoundary,
  lowerYBoundary,
  marketXStart,
  marketYStart,
  playerCardsYStart,
  upperXBoundary,
  upperYBoundary,
} from "@/constants/gameBoard";
import { cardHeight, cardWidth } from "@/constants/card";
import { BuyMachineGuards } from "./machines/guards/buy";
import { baseDuration, deckAnimationTimings } from "@/constants/animation";

const zeroRotation = { x: 0, y: 0, z: 0 };

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
    cardPositions: calcDelays(calculateCardPositions(gameState), prevUiState?.cardPositions),
    deckPositions: calculateDeckPositions(gameState),
  };
};
function calcDelays(cards: GamePieceCoordsDict, cardsPrev?: GamePieceCoordsDict): GamePieceAppearances {
  // Helper function to calculate the Euclidean distance between two positions
  // And delay the animation based on the distance (smaller distance => more delay)
  // this helps to get this "hand sweep" effect for cards that are moving

  const calcDist = (posA: Coordinate, posB: Coordinate): number => {
    return Math.sqrt(Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2));
  };

  let maxDistance = 0;

  const result = Object.entries(cards).map(([key, currentApp]) => {
    const prevApp = cardsPrev?.[key as keyof GamePieceCoordsDict] as GamePieceAppearance | undefined;
    const curPos = currentApp.transform.position;
    const curInitPos = currentApp.transform.initialPosition;
    const curExitPos = currentApp.transform.exitPosition;
    const prevPos = prevApp?.transform.position;

    let distance = 0;

    if (curPos && curInitPos && !prevPos) {
      // Appearing
      distance = calcDist(curInitPos, curPos);
    } else if (!curPos && prevPos && curExitPos) {
      // Disappearing
      distance = calcDist(prevPos, curExitPos);
    } else if (prevPos && curPos) {
      // Moving
      distance = calcDist(prevPos, curPos);
    }

    maxDistance = Math.max(maxDistance, distance);

    return [key, { ...currentApp, distance }];
  });

  const updatedCards = Object.fromEntries(
    result.map(([key, value]) => {
      const delay = (baseDuration * (maxDistance - value.distance)) / maxDistance;
      const duration = (value.distance / cardWidth) * baseDuration;

      return [key, { ...value, delay, duration } as GamePieceAppearance];
    }),
  ) as GamePieceAppearances;

  return updatedCards;
}

const calculateCardPositions = (gameState: GameState): GamePieceCoordsDict => {
  return {
    ...positionAnimalCards(gameState),
    ...positionPlantCards(gameState),
    ...positionElementMarketCards(gameState),
    ...positionDisasterCards(gameState),
    ...positionPlayerCards(gameState),
  };
};

const calculateDeckPositions = (gameState: GameState): GamePieceAppearances => {
  const turnState = getTurnState(gameState);
  return {
    animalDeck: {
      ...deckAnimationTimings,
      transform: {
        position: animalDeckPosition,
        initialPosition: animalDeckPosition,
        rotation: zeroRotation,
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
      ...deckAnimationTimings,
      transform: {
        position: plantDeckPosition,
        initialPosition: plantDeckPosition,
        rotation: zeroRotation,
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
      ...deckAnimationTimings,
      transform: {
        position: disasterDeckPosition,
        initialPosition: disasterDeckPosition,
        rotation: zeroRotation,
      },
      display: {
        visibility: turnState.isPlaying ? "dimmed" : turnState.isUsingAbility ? "dimmed" : "default",
      },
    },
    ...positionElementDecks(gameState),
    ...positionPlayerDecks(gameState),
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

export const discardPositions = (gameState: GameState): Coordinate[] => {
  const positions: Coordinate[] = [];

  if (gameState.players.length > 0) {
    positions.push({ x: upperXBoundary - cardWidth, y: lowerYBoundary + cardHeight / 2, z: 0 });
  }

  if (gameState.players.length > 1) {
    positions.push({ x: upperXBoundary - cardWidth, y: upperYBoundary - cardHeight / 2, z: 0 });
  }

  if (gameState.players.length > 2) {
    positions.push({ x: lowerXBoundary + cardWidth, y: upperYBoundary - cardHeight / 2, z: 0 });
  }

  if (gameState.players.length > 3) {
    positions.push({ x: lowerXBoundary + cardWidth, y: lowerYBoundary + cardHeight / 2, z: 0 });
  }

  return positions;
};

export const positionAnimalCards = (gameState: GameState): GamePieceCoordsDict => {
  const turnState = getTurnState(gameState);

  return {
    ...gameState.animalMarket.table.reduce((acc, card: AnimalCard, index: number) => {
      acc[card.uid] = {
        transform: {
          position: {
            x: marketXStart + (index + 1) * cardXOffset,
            y: marketYStart,
            z: 0 + +BuyMachineGuards.canBuyCard({ context: gameState }, card) * 0.5,
          },
          rotation: zeroRotation,
          initialPosition: animalDeckPosition,
          initialRotation: { x: 0, y: -Math.PI, z: 0 },
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
    }, {} as GamePieceCoordsDict),

    ...gameState.animalMarket.deck.reduce((acc, card: AnimalCard) => {
      acc[card.uid] = {
        transform: {
          initialPosition: animalDeckPosition,
          initialRotation: { x: 0, y: -Math.PI, z: 0 },
          exitPosition: animalDeckPosition,
          exitRotation: zeroRotation,
        } as AbsentPieceTransform,
      };
      return acc;
    }, {} as GamePieceCoordsDict),
  };
};

export const positionPlantCards = (gameState: GameState): GamePieceCoordsDict => {
  const turnState = getTurnState(gameState);
  return {
    ...gameState.plantMarket.table.reduce((acc, card: PlantCard, index: number) => {
      acc[card.uid] = {
        transform: {
          position: {
            x: marketXStart + (index + 1) * cardXOffset,
            y: marketYStart - cardYOffset,
            z: 0 + +BuyMachineGuards.canBuyCard({ context: gameState }, card) * 0.5,
          },
          rotation: zeroRotation,
          initialPosition: plantDeckPosition,
          initialRotation: { x: 0, y: -Math.PI, z: 0 },
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
    }, {} as GamePieceCoordsDict),

    ...gameState.plantMarket.deck.reduce((acc, card: PlantCard) => {
      acc[card.uid] = {
        transform: {
          initialPosition: plantDeckPosition,
          initialRotation: { x: 0, y: -Math.PI, z: 0 },
          exitPosition: plantDeckPosition,
          exitRotation: zeroRotation,
        } as AbsentPieceTransform,
      };
      return acc;
    }, {} as GamePieceCoordsDict),
  };
};

export const positionElementMarketCards = (gameState: GameState): GamePieceCoordsDict =>
  ([gameState.turn.borrowedElement, ...gameState.elementMarket.deck].filter(Boolean) as ElementCard[]).reduce(
    (acc, card: ElementCard) => {
      const borrowedPosition = {
        x: marketXStart + 5 * cardXOffset,
        y: marketYStart - 2 * cardYOffset,
        z: 0,
      };
      const deckPosition = positionElementDecks(gameState)[`${card.name}ElementDeck`]?.transform.position;
      const isBorrowed = gameState.turn.borrowedElement?.uid === card.uid;

      acc[card.uid] = {
        transform: {
          initialPosition: deckPosition,
          initialRotation: zeroRotation,
          exitPosition: deckPosition,
          exitRotation: zeroRotation,
          position: isBorrowed ? borrowedPosition : undefined,
          rotation: isBorrowed ? zeroRotation : undefined,
        } as AbsentPieceTransform,
        display: {
          visibility: isBorrowed ? "default" : "hidden",
        },
      };

      return acc;
    },
    {} as GamePieceCoordsDict,
  );

export const positionDisasterCards = (gameState: GameState): GamePieceCoordsDict =>
  gameState.disasterMarket.table.reduce((acc, card: DisasterCard) => {
    acc[card.uid] = {
      transform: {
        position: {
          x: marketXStart - 2 * cardXOffset,
          y: marketYStart - 2 * cardYOffset,
          z: 0,
        },
        rotation: zeroRotation,
        initialPosition: { x: disasterDeckPosition.x, y: disasterDeckPosition.y, z: disasterDeckPosition.z },
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
      },
    };
    return acc;
  }, {} as GamePieceCoordsDict);

export const positionElementDecks = (gameState: GameState): GamePieceCoordsDict => {
  const turnState = getTurnState(gameState);
  return uniqBy(gameState.elementMarket.deck, "name")
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, card: ElementCard, index: number) => {
      acc[`${card.name}ElementDeck`] = {
        ...deckAnimationTimings,
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
    }, {} as GamePieceCoordsDict);
};

export const positionPlayerDecks = (gameState: GameState): GamePieceCoordsDict => {
  const turnState = getTurnState(gameState);
  return gameState.players.reduce((acc, player, playerIndex) => {
    acc[`${player.uid}PlayerDeck`] = {
      ...deckAnimationTimings,
      transform: {
        position: supplyDeckPositions(gameState)[playerIndex],
        initialPosition: supplyDeckPositions(gameState)[playerIndex],
        exitPosition: supplyDeckPositions(gameState)[playerIndex],
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
    acc[`${player.uid}PlayerDiscard`] = {
      transform: {
        initialPosition: discardPositions(gameState)[playerIndex],
        position: discardPositions(gameState)[playerIndex],
        rotation: {
          x: 0,
          y: 0,
          z: playerIndex * Math.PI,
        },
      },
    };
    return acc;
  }, {} as GamePieceCoordsDict);
};

export const positionPlayerCards = (gameState: GameState): GamePieceCoordsDict => {
  const turnState = getTurnState(gameState);
  return gameState.players.reduce((acc, player, playerIndex) => {
    const deckPosition = supplyDeckPositions(gameState)[playerIndex];
    const discardPosition = discardPositions(gameState)[playerIndex];
    const rotation = { x: 0, y: 0, z: playerIndex * (Math.PI / 2) };
    const yFlipRotation = { y: Math.PI };
    const { playedCards, exhaustedCards } = gameState.turn;
    const deckRotation = { ...rotation, ...yFlipRotation };
    const discardRotation = { ...rotation };

    player.deck.forEach((card: Card) => {
      acc[card.uid] = {
        transform: {
          initialRotation: deckRotation,
          initialPosition: deckPosition,
          exitRotation: deckRotation,
          exitPosition: deckPosition,
        } as AbsentPieceTransform,
      };
    });

    player.discard.forEach((card: Card) => {
      acc[card.uid] = {
        transform: {
          initialRotation: discardRotation,
          initialPosition: discardPosition,
          exitRotation: discardRotation,
          exitPosition: discardPosition,
        } as AbsentPieceTransform,
      };
    });

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
          // turnState.player === player.uid,
          true,
        );

        acc[card.uid] = {
          transform: {
            position: {
              x: deckPosition.x + offset.x,
              y: deckPosition.y + offset.y,
              z: 0,
            },
            rotation,
            initialRotation: deckRotation,
            initialPosition: deckPosition,
            exitPosition: discardPosition,
            exitRotation: discardRotation,
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
          // turnState.player === player.uid,
          true,
        );

        acc[card.uid] = {
          transform: {
            position: {
              x: deckPosition.x + offset.x,
              y: deckPosition.y + offset.y,
              z: 0,
            },
            rotation,
            initialRotation: deckRotation,
            initialPosition: deckPosition,
            exitPosition: discardPosition,
            exitRotation: discardRotation,
          },
          display: {
            visibility: "dimmed",
          },
        };
      });

    return acc;
  }, {} as GamePieceCoordsDict);
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
