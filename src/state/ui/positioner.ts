import { isEmpty, uniqBy } from "lodash-es";
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
  GamePieceAppearances,
  AbsentPieceTransform,
  DisasterUID,
  HabitatUID,
  ExtinctionUID,
  ExtinctionTile,
  HabitatTile,
  isHabitatUID,
  isExtinctionUID,
  GamePieceUID,
} from "../types";
import {
  cardXOffset,
  cardYOffset,
  extinctionTileYStart,
  habitatTileYStart,
  hexagonTileXStart,
  lowerXBoundary,
  lowerYBoundary,
  marketXStart,
  marketYStart,
  playerCardsYStart,
  upperXBoundary,
  upperYBoundary,
  tileGridCoordinates,
  tileSize,
} from "@/constants/gameBoard";
import { cardHeight, cardWidth } from "@/constants/card";
import { TurnMachineGuards } from "../machines/guards";
import { deckAnimationTimings } from "@/constants/animation";
import { calcDelays } from "@/state/ui/animation-scheduler";

const zeroRotation = { x: 0, y: 0, z: 0 };
const yFlipRotation = { y: -Math.PI };

export const toUiState = (prevUiState: UiState | null, gameState: GameState): UiState => {
  return {
    cardPositions: calcDelays(calculateCardPositions(gameState), prevUiState?.cardPositions),
    deckPositions: calculateDeckPositions(gameState),
  };
};

const calculateCardPositions = (gameState: GameState): GamePieceCoordsDict => {
  return {
    ...positionAnimalCards(gameState),
    ...positionPlantCards(gameState),
    ...positionElementMarketCards(gameState),
    ...positionDisasterCards(gameState),
    ...positionPlayerCards(gameState),
    ...positionExtinctionTiles(gameState),
    ...positionHabitatTiles(gameState),
    ...positionStagedCards(gameState),
  };
};

const calculateDeckPositions = (gameState: GameState): GamePieceAppearances => {
  return {
    animalDeck: {
      ...deckAnimationTimings,
      position: animalDeckPosition,
      initialPosition: animalDeckPosition,
      rotation: zeroRotation,
    },
    plantDeck: {
      ...deckAnimationTimings,
      position: plantDeckPosition,
      initialPosition: plantDeckPosition,
      rotation: zeroRotation,
    },
    disasterDeck: {
      ...deckAnimationTimings,
      position: disasterDeckPosition,
      initialPosition: disasterDeckPosition,
      rotation: zeroRotation,
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
  const tipx = 4;
  const tipy = 8.7;

  if (gameState.players.length > 0) {
    positions.push({ x: upperXBoundary - cardWidth * 3, y: lowerYBoundary - tipy, z: 0 });
  }

  if (gameState.players.length > 1) {
    positions.push({ x: upperXBoundary + tipx, y: upperYBoundary - cardHeight / 2, z: 0 });
  }

  if (gameState.players.length > 2) {
    positions.push({ x: lowerXBoundary + cardWidth, y: upperYBoundary + tipy, z: 0 });
  }

  if (gameState.players.length > 3) {
    positions.push({ x: lowerXBoundary - tipx, y: lowerYBoundary + cardHeight / 2, z: 0 });
  }

  return positions;
};

export const positionStagedCards = (gameState: GameState): GamePieceCoordsDict => {
  const cause = gameState.stage?.cause || [];
  const effect = gameState.stage?.effect;

  const pieceCoordinates = fanCards(cause);
  const tileCoordinates = tileGridCoordinates(0, isEmpty(cause) ? 0 + tileSize : 20);

  effect?.forEach((uid: DisasterUID | HabitatUID | ExtinctionUID, index) => {
    const isTile = isHabitatUID(uid) || isExtinctionUID(uid);
    const useTileCoordinates = isTile && effect.length > 2;

    pieceCoordinates[uid] = {
      position: {
        x: useTileCoordinates
          ? tileCoordinates[index].x
          : effect.length === 1
            ? 0
            : -(6 * (effect.length - 1)) / 2 + index * 6,
        y: useTileCoordinates ? tileCoordinates[index].y : cause.length === 0 ? 0 : cardHeight - 5,
        z: 75,
      },
      rotation: {
        x: isTile ? -Math.PI / 2 : 0,
        y: 0,
        z: 0,
      },
      initialPosition: disasterDeckPosition,
      initialRotation: { x: 0, y: 0, z: 0 },
    };
  });

  return pieceCoordinates;
};

export const positionExtinctionTiles = (gameState: GameState): GamePieceCoordsDict => {
  const coordinates = tileGridCoordinates(hexagonTileXStart, extinctionTileYStart);
  const allExtinctionTiles = [...gameState.extinctMarket.deck, ...gameState.extinctMarket.table];

  return {
    ...allExtinctionTiles.reduce((acc, extinctionTile: ExtinctionTile, index: number) => {
      acc[extinctionTile.uid] = {
        position: coordinates[index],
        initialPosition: coordinates[index],
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        initialRotation: { x: -Math.PI / 2, y: 0, z: 0 },
      };
      return acc;
    }, {} as GamePieceCoordsDict),
  };
};

export const positionHabitatTiles = (gameState: GameState): GamePieceCoordsDict => {
  const coordinates = tileGridCoordinates(hexagonTileXStart, habitatTileYStart);

  return {
    ...gameState.habitatMarket.deck.reduce((acc, habitatTile: HabitatTile, index: number) => {
      acc[habitatTile.uid] = {
        position: coordinates[index],
        initialPosition: coordinates[index],
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        initialRotation: { x: -Math.PI / 2, y: 0, z: 0 },
      };
      return acc;
    }, {} as GamePieceCoordsDict),
  };
};

export const positionAnimalCards = (gameState: GameState): GamePieceCoordsDict => {
  return {
    ...gameState.animalMarket.table.reduce((acc, card: AnimalCard, index: number) => {
      acc[card.uid] = {
        position: {
          x: marketXStart + (index + 1) * cardXOffset,
          y: marketYStart,
          z: 0 + +TurnMachineGuards.canBuyCard({ context: gameState }, card) * 0.5,
        },
        rotation: zeroRotation,
        initialPosition: animalDeckPosition,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
      };
      return acc;
    }, {} as GamePieceCoordsDict),

    ...gameState.animalMarket.deck.reduce((acc, card: AnimalCard) => {
      acc[card.uid] = {
        initialPosition: animalDeckPosition,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
        exitPosition: animalDeckPosition,
        exitRotation: zeroRotation,
      } as AbsentPieceTransform;

      return acc;
    }, {} as GamePieceCoordsDict),
  };
};

export const positionPlantCards = (gameState: GameState): GamePieceCoordsDict => {
  return {
    ...gameState.plantMarket.table.reduce((acc, card: PlantCard, index: number) => {
      acc[card.uid] = {
        position: {
          x: marketXStart + (index + 1) * cardXOffset,
          y: marketYStart - cardYOffset,
          z: 0 + +TurnMachineGuards.canBuyCard({ context: gameState }, card) * 0.5,
        },
        rotation: zeroRotation,
        initialPosition: plantDeckPosition,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
      };
      return acc;
    }, {} as GamePieceCoordsDict),

    ...gameState.plantMarket.deck.reduce((acc, card: PlantCard) => {
      acc[card.uid] = {
        initialPosition: plantDeckPosition,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
        exitPosition: plantDeckPosition,
        exitRotation: zeroRotation,
      } as AbsentPieceTransform;

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
      const deckPosition = positionElementDecks(gameState)[`${card.name}ElementDeck`]?.position;
      const isBorrowed = gameState.turn.borrowedElement?.uid === card.uid;

      acc[card.uid] = {
        initialPosition: deckPosition,
        initialRotation: zeroRotation,
        exitPosition: deckPosition,
        exitRotation: zeroRotation,
        position: isBorrowed ? borrowedPosition : undefined,
        rotation: isBorrowed ? zeroRotation : undefined,
      } as AbsentPieceTransform;

      return acc;
    },
    {} as GamePieceCoordsDict,
  );

export const positionDisasterCards = (gameState: GameState): GamePieceCoordsDict => ({
  ...gameState.disasterMarket.table.reduce((acc, card: DisasterCard) => {
    acc[card.uid] = {
      position: {
        ...disasterDeckPosition,
        z: 3,
      },
      rotation: zeroRotation,
      initialPosition: { ...disasterDeckPosition, z: 3 },
      exitPosition: { ...disasterDeckPosition, z: 3 },
      initialRotation: { x: 0, y: -Math.PI, z: 0 },
    };
    return acc;
  }, {} as GamePieceCoordsDict),

  ...gameState.disasterMarket.deck.reduce((acc, card: DisasterCard) => {
    acc[card.uid] = {
      initialPosition: { ...disasterDeckPosition, z: 3 },
      initialRotation: { x: 0, y: -Math.PI, z: 0 },
      exitPosition: { ...disasterDeckPosition, z: 3 },
      exitRotation: { x: 0, y: -Math.PI, z: 0 },
    };
    return acc;
  }, {} as GamePieceCoordsDict),
});

export const positionElementDecks = (gameState: GameState): GamePieceCoordsDict => {
  return uniqBy(gameState.elementMarket.deck, "name")
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, card: ElementCard, index: number) => {
      acc[`${card.name}ElementDeck`] = {
        ...deckAnimationTimings,
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
    }, {} as GamePieceCoordsDict);
};

export const positionPlayerDecks = (gameState: GameState): GamePieceCoordsDict => {
  return gameState.players.reduce((acc, player, playerIndex) => {
    acc[`${player.uid}PlayerDeck`] = {
      ...deckAnimationTimings,
      position: supplyDeckPositions(gameState)[playerIndex],
      initialPosition: supplyDeckPositions(gameState)[playerIndex],
      exitPosition: supplyDeckPositions(gameState)[playerIndex],
      rotation: {
        x: 0,
        y: 0,
        z: playerIndex * (Math.PI / 2),
      },
    };
    acc[`${player.uid}PlayerDiscard`] = {
      initialPosition: discardPositions(gameState)[playerIndex],

      position: discardPositions(gameState)[playerIndex],
      rotation: {
        x: 0,
        y: 0,
        z: playerIndex * Math.PI,
      },
    };
    return acc;
  }, {} as GamePieceCoordsDict);
};

export const positionPlayerCards = (gameState: GameState): GamePieceCoordsDict => {
  return gameState.players.reduce((acc, player, playerIndex) => {
    const deckPosition = supplyDeckPositions(gameState)[playerIndex];
    const discardPosition = discardPositions(gameState)[playerIndex];
    const rotation = { x: 0, y: 0, z: playerIndex * (Math.PI / 2) };
    const { playedCards, exhaustedCards } = gameState.turn;
    const deckRotation = { ...rotation, ...yFlipRotation };
    const discardRotation = { ...rotation };

    player.deck.forEach((card: Card) => {
      acc[card.uid] = {
        initialRotation: deckRotation,
        initialPosition: deckPosition,
        exitRotation: deckRotation,
        exitPosition: deckPosition,
      } as AbsentPieceTransform;
    });

    player.discard.forEach((card: Card) => {
      acc[card.uid] = {
        initialRotation: discardRotation,
        initialPosition: discardPosition,
        exitRotation: discardRotation,
        exitPosition: discardPosition,
      } as AbsentPieceTransform;
    });

    player.hand
      .filter((card) => !exhaustedCards.includes(card.uid))
      .forEach((card: Card, cardIndex: number) => {
        const inPlay = playedCards.includes(card.uid);
        const offset = getPlayerCardOffset(playerIndex, cardIndex, player.hand.length, inPlay, false, true);

        acc[card.uid] = {
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
        };
      });

    player.hand
      .filter((card) => exhaustedCards.includes(card.uid))
      .forEach((card: Card, cardIndex: number) => {
        const inPlay = playedCards.includes(card.uid);
        const offset = getPlayerCardOffset(
          playerIndex,
          cardIndex,
          player.hand.length - exhaustedCards.length,
          inPlay,
          true,
          true,
        );

        acc[card.uid] = {
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

export const fanCards = (cardUids: GamePieceUID[]): GamePieceCoordsDict => {
  const gamePieceCoords: GamePieceCoordsDict = {};
  const count = cardUids.length;

  if (count === 1) {
    gamePieceCoords[cardUids[0]] = {
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 65,
      },
    };
    return gamePieceCoords;
  }

  const yOffset = -2;

  for (let i = 0; i < count; i++) {
    let x,
      y,
      z = 65,
      rotateZ = 0;

    if (count % 2 === 0) {
      const midLeft = count / 2 - 1;
      const midRight = count / 2;

      if (i === midLeft) {
        x = -4;
        y = 0;
        rotateZ = Math.PI / 24;
      } else if (i === midRight) {
        x = 4;
        y = 0;
        rotateZ = Math.PI / -24;
        z = 67;
      } else {
        const distanceFromMiddle = Math.abs(i - midLeft - 0.5);
        x = (i < midLeft ? -1 : 1) * (4 + distanceFromMiddle * 4);
        y = yOffset * distanceFromMiddle;
        rotateZ = (((i < midLeft ? 1 : -1) * Math.PI) / 24) * distanceFromMiddle;
      }
    } else {
      const mid = Math.floor(count / 2);

      if (i === mid) {
        x = 0;
        y = 0;
        z = 66;
        rotateZ = 0;
      } else {
        const distanceFromMiddle = Math.abs(i - mid);
        x = (i < mid ? -1 : 1) * distanceFromMiddle * 8;
        y = yOffset * distanceFromMiddle;
        rotateZ = (((i < mid ? 1 : -1) * Math.PI) / 24) * distanceFromMiddle;
      }
    }

    gamePieceCoords[cardUids[i]] = {
      position: {
        x,
        y,
        z,
      },
      rotation: {
        x: 0,
        y: 0,
        z: rotateZ,
      },
    };
  }

  return gamePieceCoords;
};