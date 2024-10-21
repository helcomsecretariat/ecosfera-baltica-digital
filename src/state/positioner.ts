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
  GamePiece,
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
import { BuyMachineGuards } from "./machines/guards";
import { baseDuration, deckAnimationTimings } from "@/constants/animation";

const zeroRotation = { x: 0, y: 0, z: 0 };
const yFlipRotation = { y: -Math.PI };

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
  const calcDist = (posA: Coordinate, posB: Coordinate): number => {
    return Math.sqrt(Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2));
  };

  const numBins = 8;

  type MotionDataEntry = {
    key: string;
    deltaX: number;
    deltaY: number;
    angle: number;
    distance: number;
    cardAppearance: GamePieceAppearance;
    startPoint: Coordinate;
    endPoint: Coordinate;
    isDisappearing?: boolean;
  };

  const motionData: MotionDataEntry[] = [];

  function detectOverlaps(motionData: MotionDataEntry[]): Map<string, string> {
    const overlaps = new Map<string, string>();

    for (let i = 0; i < motionData.length; i++) {
      if (motionData[i].distance === 0) continue;
      if (motionData[i].isDisappearing) continue;
      for (let j = 0; j < motionData.length; j++) {
        if (motionData[j].distance === 0) continue;

        // a bit complex logic to detect "played card" overlaps
        const sameX = motionData[i].endPoint.x === motionData[j].startPoint.x;
        const sameY = motionData[i].endPoint.y === motionData[j].startPoint.y;
        // ideally should take into account side players for card widht vs height
        const closeX = Math.abs(motionData[i].endPoint.x - motionData[j].startPoint.x) < cardHeight / 4;
        const closeY = Math.abs(motionData[i].endPoint.y - motionData[j].startPoint.y) < cardHeight / 4;

        if ((sameX && closeY) || (sameY && closeX)) {
          overlaps.set(motionData[i].key, motionData[j].key);
          break;
        }
      }
    }

    return overlaps;
  }

  Object.entries(cards).forEach(([key, currentApp]) => {
    const prevApp = cardsPrev?.[key as keyof GamePieceCoordsDict] as GamePieceAppearance | undefined;
    const curPos = currentApp.transform.position;
    const curInitPos = currentApp.transform.initialPosition;
    const curExitPos = currentApp.transform.exitPosition;
    const prevPos = prevApp?.transform.position;

    let distance = 0;
    let deltaX = 0;
    let deltaY = 0;
    let startPoint: Coordinate = { x: 0, y: 0, z: 0 };
    let endPoint: Coordinate = { x: 0, y: 0, z: 0 };
    let isDisappearing = false;

    if (curPos && curInitPos && !prevPos) {
      startPoint = curInitPos;
      endPoint = curPos;
    } else if (!curPos && prevPos && curExitPos) {
      startPoint = prevPos;
      endPoint = curExitPos;
      isDisappearing = true;
    } else if (prevPos && curPos) {
      startPoint = prevPos;
      endPoint = curPos;
    }
    distance = calcDist(startPoint, endPoint);
    deltaX = startPoint.x - endPoint.x;
    deltaY = startPoint.y - endPoint.y;

    const angle = Math.atan2(deltaY, deltaX);

    motionData.push({
      key,
      deltaX,
      deltaY,
      angle,
      distance,
      cardAppearance: currentApp,
      startPoint,
      endPoint,
      isDisappearing,
    });
  });

  const overlaps = detectOverlaps(motionData);
  const groups = new Map<number, typeof motionData>();

  motionData.forEach((data) => {
    const binIndex = Math.floor(((data.angle + Math.PI) / (2 * Math.PI)) * numBins) % numBins;
    if (!groups.has(binIndex)) {
      groups.set(binIndex, []);
    }
    groups.get(binIndex)!.push(data);
  });

  const sortedBinIndices = Array.from(groups.keys()).sort((a, b) => {
    const cardsA = groups.get(a)!;
    const cardsB = groups.get(b)!;
    const isAlandsOnB = cardsA.some(({ key }) => cardsB.find((cardB) => cardB.key === overlaps.get(key)));
    const isBlandsOnA = cardsB.some(({ key }) => cardsA.find((cardA) => cardA.key === overlaps.get(key)));

    if (isAlandsOnB) return 1;
    if (isBlandsOnA) return -1;

    return 0;

    // return groups.get(b)!.length - groups.get(a)!.length;
  });

  let cumulativeDelay = 0;
  const updatedCards: GamePieceAppearances = {};

  console.log("===========================================");
  console.log(`Total groups detected: ${sortedBinIndices.length}`);

  sortedBinIndices.forEach((binIndex, groupIndex) => {
    const group = groups.get(binIndex)!;

    const groupMaxDistance = Math.max(...group.map((data) => data.distance));

    let groupMaxEndTime = 0;

    console.log("---------");
    group.forEach((data) => {
      if (data.distance) console.log("data.key", data.key);

      // Safeguard against division by zero
      const intraGroupDelay =
        groupMaxDistance > 0 ? ((groupMaxDistance - data.distance) / groupMaxDistance) * baseDuration : 0;

      const duration = (data.distance / cardWidth) * baseDuration;

      const totalDelay = cumulativeDelay === 0 ? intraGroupDelay : cumulativeDelay + intraGroupDelay + baseDuration * 2;

      //@ts-expect-error TS is confused
      updatedCards[data.key] = {
        ...data.cardAppearance,
        delay: totalDelay,
        duration,
      };

      const endTime = totalDelay + duration;
      groupMaxEndTime = Math.max(groupMaxEndTime, endTime);
    });

    console.log(
      `Group ${groupIndex} (bin: ${binIndex}) - Max end time in group: ${groupMaxEndTime}, Cumulative delay before this group: ${cumulativeDelay}`,
    );

    cumulativeDelay = groupMaxEndTime;

    console.log(`Cumulative delay after Group ${groupIndex}: ${cumulativeDelay}`);
  });

  return updatedCards;
}

const calculateCardPositions = (gameState: GameState): GamePieceCoordsDict => {
  return {
    ...positionAnimalCards(gameState),
    ...positionPlantCards(gameState),
    ...positionElementMarketCards(gameState),
    ...positionDisasterCards(gameState),
    ...positionPlayerCards(gameState),
    ...positionStagedCards(gameState),
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

  const pieceCoordinates = cause.reduce((acc, card: ElementCard | DisasterCard | AnimalCard, index: number) => {
    let middleIndex = Math.floor((cause.length - 1) / 2);
    if (cause.length === 2) middleIndex = 0;

    acc[card.uid] = {
      transform: {
        position: {
          x: (index - middleIndex) * 6,
          y: (effect !== undefined ? 15 : 5) - Math.abs(index - middleIndex) * 3,
          z: 50 - Math.abs(index - middleIndex),
        },
        rotation: {
          x: 0,
          y: 0,
          z:
            cause.length === 2
              ? index === 0
                ? Math.PI / 24
                : -Math.PI / 24
              : ((index - middleIndex) / middleIndex) * (Math.PI / 12) * -1,
        },
        initialPosition: disasterDeckPosition,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
      },
    };

    return acc;
  }, {} as GamePieceCoordsDict);

  effect?.forEach((gamePiece: GamePiece) => {
    pieceCoordinates[gamePiece.uid] = {
      transform: {
        position: {
          x: 0,
          y: cause.length === 0 ? 5 : -10,
          z: 50,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        initialPosition: disasterDeckPosition,
        initialRotation: { x: 0, y: 0, z: 0 },
      },
    };
  });

  return pieceCoordinates;
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
          ...disasterDeckPosition,
          z: 3,
        },
        rotation: zeroRotation,
        initialPosition: { ...disasterDeckPosition, z: 3 },
        exitPosition: { ...disasterDeckPosition, z: 3 },
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
