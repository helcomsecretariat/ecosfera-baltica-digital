import { find, isEmpty, last, map } from "lodash-es";
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
  ExtinctionTile,
  HabitatTile,
  isHabitatUID,
  isExtinctionUID,
  AnimalUID,
  PlantUID,
  PlayerUID,
  PolicyCard,
  isPolicyUID,
  HabitatName,
} from "../types";
import {
  abilityOffset,
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
  tileSize,
  overlappingCardXOffset,
  policyCardXOffset,
  tileGridTransforms,
  habitatTransforms,
} from "@/constants/gameBoard";
import { cardDepth, cardHeight, cardWidth } from "@/constants/card";
import { TurnMachineGuards } from "../machines/guards";
import { deckAnimationTimings } from "@/constants/animation";
import { calcDelays } from "@/state/ui/animation-scheduler";

const zeroPosition = { x: 0, y: 0, z: 0 };
const zeroRotation = { x: 0, y: 0, z: 0 };
const yFlipRotation = { y: -Math.PI };
const playerZRotations = [0, Math.PI / 2, 0, 3 * (Math.PI / 2)] as const;

export const toUiState = (prevUiState: UiState | null, gameState: GameState): UiState => {
  const allDelays = calcDelays(
    {
      ...calculateCardPositions(gameState),
      ...calculateDeckPositions(gameState),
    },
    {
      ...prevUiState?.cardPositions,
      ...prevUiState?.deckPositions,
    },
  );
  // TODO: get rid of cardPositions/deckPositions and use flat structure instead
  return {
    cardPositions: allDelays,
    deckPositions: allDelays,
  };
};

const calculateCardPositions = (gameState: GameState): GamePieceCoordsDict => {
  return {
    ...positionAnimalCards(gameState),
    ...positionPlantCards(gameState),
    ...positionPolicyCards(gameState),
    ...positionElementMarketCards(gameState),
    ...positionDisasterCards(gameState),
    ...positionPlayerCards(gameState),
    ...positionExtinctionTiles(gameState),
    ...positionHabitatTiles(gameState),
    ...positionStagedCards(gameState),
    ...positionAbilityTokens(gameState),
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

const getSupplyDeckOffset = (gameState: GameState, playerUid: PlayerUID) => {
  const player = find(gameState.players, { uid: playerUid })!;
  const exhaustedCards = playerUid === gameState.turn.player ? gameState.turn.exhaustedCards : [];
  const exhaustedCardsWithAbilities = exhaustedCards.filter(
    (exhaustedCardUid) =>
      player.hand.some(
        (card: Card) =>
          (card.type === "animal" || card.type === "plant") &&
          card.uid === exhaustedCardUid &&
          card.abilities.length > 0,
      ) && !map(gameState.turn.usedAbilities, "source").includes(exhaustedCardUid as AnimalUID | PlantUID),
  );

  const numNonOverlappingCards = player.hand.length - exhaustedCards.length + exhaustedCardsWithAbilities.length;
  const numOverlappingCards = exhaustedCards.length - exhaustedCardsWithAbilities.length;

  const offset = Math.ceil(
    (numNonOverlappingCards * cardXOffset +
      numOverlappingCards * overlappingCardXOffset +
      (exhaustedCards.length > 0 ? cardXOffset * 1.5 : 0)) /
      2,
  );

  if (offset < cardXOffset * 2) {
    return cardXOffset * 2;
  }

  return offset;
};

export const animalDeckPosition: Coordinate = { x: marketXStart, y: marketYStart, z: 0 };
export const plantDeckPosition: Coordinate = { x: marketXStart, y: marketYStart - cardYOffset, z: 0 };
export const disasterDeckPosition: Coordinate = {
  x: marketXStart - cardXOffset,
  y: marketYStart - 2 * cardYOffset,
  z: 0,
};

export const supplyDeckPositions = (gameState: GameState) =>
  [
    gameState.players[0] && {
      x: 0 - getSupplyDeckOffset(gameState, gameState.players[0].uid),
      y: playerCardsYStart,
      z: 0,
    },
    gameState.players[1] && {
      x: upperXBoundary - cardHeight / 2,
      y: 0 - getSupplyDeckOffset(gameState, gameState.players[1].uid),
      z: 0,
    },
    gameState.players[2] && {
      x: 0 - getSupplyDeckOffset(gameState, gameState.players[2].uid),
      y: upperYBoundary - cardHeight / 2,
      z: 0,
    },
    gameState.players[3] && {
      x: lowerXBoundary + cardHeight / 2,
      y: 0 + getSupplyDeckOffset(gameState, gameState.players[3].uid),
      z: 0,
    },
  ] as Coordinate[];

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
  if (gameState.stage?.hidden) return {};
  const cause = gameState.stage?.cause || [];
  const effect = gameState.stage?.effect;
  const pieceCoordinates: GamePieceCoordsDict = {};

  // Position cause cards/tiles in a fan layout
  cause.forEach((uid, i) => {
    const isTile = isHabitatUID(uid) || isExtinctionUID(uid);
    const transforms = tileGridTransforms(0, 20);
    const habitatSpecificTransforms = habitatTransforms(0, 20);
    const tileTransform = isHabitatUID(uid)
      ? habitatSpecificTransforms[find(gameState.habitatMarket.deck, { uid })?.name as HabitatName]
      : transforms[i];

    if (cause.length === 1) {
      pieceCoordinates[uid] = {
        position: isTile
          ? { x: tileTransform?.position?.x ?? 0, y: (tileTransform?.position?.y ?? 0) - 25, z: 65 }
          : { x: 0, y: 0, z: 85 },
        rotation: isTile ? (tileTransform?.rotation ?? zeroRotation) : zeroRotation,
      };
    } else {
      const yOffset = -2;
      let x,
        y,
        z = 65,
        rotateZ = 0;

      if (cause.length % 2 === 0) {
        const midLeft = cause.length / 2 - 1;
        const midRight = cause.length / 2;

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
        const mid = Math.floor(cause.length / 2);
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

      pieceCoordinates[uid] = {
        position: { x, y, z },
        rotation: isTile ? (tileTransform?.rotation ?? { x: 0, y: 0, z: rotateZ }) : { x: 0, y: 0, z: rotateZ },
      };
    }
  });

  // Position effect cards/tiles
  const transforms = tileGridTransforms(0, isEmpty(cause) ? 5 + tileSize : 25);
  const habitatSpecificTransforms = habitatTransforms(0, isEmpty(cause) ? 5 + tileSize : 25);

  effect?.forEach((uid, index) => {
    const isTile = isHabitatUID(uid) || isExtinctionUID(uid);
    const isHabitatTile = isHabitatUID(uid);
    const isPolicyCard = isPolicyUID(uid);
    const useTileCoordinates = isTile && effect.length === 6;
    const tileTransform = isHabitatTile
      ? habitatSpecificTransforms[find(gameState.habitatMarket.deck, { uid })?.name as HabitatName]
      : transforms[index];

    pieceCoordinates[uid] = {
      position: {
        x: useTileCoordinates
          ? (tileTransform?.position?.x ?? zeroPosition.x)
          : effect.length === 1
            ? 0
            : -((isPolicyCard ? policyCardXOffset : 6) * (effect.length - 1)) / 2 +
              index * (isPolicyCard ? policyCardXOffset : 6),
        y: useTileCoordinates
          ? (tileTransform?.position?.y ?? zeroPosition.y)
          : cause.length === 0
            ? 0
            : cardHeight - 5,
        z: 75 + (isTile && !useTileCoordinates ? index * 2 : 0),
      },
      rotation: isTile ? (tileTransform?.rotation ?? zeroRotation) : zeroRotation,
      initialPosition: disasterDeckPosition,
      initialRotation: { x: 0, y: 0, z: 0 },
    };
  });

  return pieceCoordinates;
};

export const positionAbilityTokens = (gameState: GameState): GamePieceCoordsDict => {
  return gameState.players.reduce((acc, player, playerIndex) => {
    const deckPosition = supplyDeckPositions(gameState)[playerIndex];
    const rotation = { x: 0, y: 0, z: 0 };
    const isVertical = playerIndex === 0 || playerIndex === 2;
    const isHorizontal = !isVertical;

    const startPosition = [
      //first Player
      { x: deckPosition.x - cardWidth, y: deckPosition.y - abilityOffset, z: 0 },

      // second Player
      { x: deckPosition.x - abilityOffset, y: deckPosition.y - cardWidth, z: 0 },

      // third Player
      { x: deckPosition.x - cardWidth, y: deckPosition.y - abilityOffset, z: 0 },

      // fourth Player
      { x: deckPosition.x - abilityOffset, y: deckPosition.y + cardWidth, z: 0 },
    ][playerIndex];

    player.abilities.forEach((ability, index) => {
      acc[ability.uid] = {
        position: {
          x: isHorizontal ? startPosition.x + index * 7 : startPosition.x,
          y: isVertical ? startPosition.y + index * 7 : startPosition.y,
          z: startPosition.z,
        },
        rotation,
        initialPosition: startPosition,
        initialRotation: rotation,
      };
    });

    // refreshing abilities
    if (
      player.uid === gameState.turn.player &&
      gameState.stage?.eventType === "abilityRefresh" &&
      !gameState.stage?.hidden
    ) {
      const canRefresh = TurnMachineGuards.canRefreshAbility({ context: gameState });
      const lastRefreshedAbility = find(player.abilities, { uid: last(gameState.turn.refreshedAbilityUids) });
      const abilitiesOnStage = canRefresh ? player.abilities.filter(({ isUsed }) => isUsed) : [lastRefreshedAbility!];

      abilitiesOnStage.filter(Boolean).forEach((ability, index, usedAbilities) => {
        acc[ability.uid] = {
          ...acc[ability.uid],
          position: {
            x:
              usedAbilities.length === 1
                ? 0
                : 0 - Math.ceil(usedAbilities.length / 2) * (abilityOffset / 2) + abilityOffset * index,
            y: -cardHeight + 1.8,
            z: 50,
          },
          rotation: { x: 0, y: 0, z: 0 },
        };
      });
    }

    return acc;
  }, {} as GamePieceCoordsDict);
};

export const positionExtinctionTiles = (gameState: GameState): GamePieceCoordsDict => {
  const transforms = tileGridTransforms(hexagonTileXStart, extinctionTileYStart);
  const allExtinctionTiles = [...gameState.extinctMarket.deck, ...gameState.extinctMarket.table];

  return {
    ...allExtinctionTiles.reduce((acc, extinctionTile: ExtinctionTile, index: number) => {
      acc[extinctionTile.uid] = {
        position: transforms[index]?.position ?? zeroPosition,
        initialPosition: transforms[index]?.position,
        rotation: transforms[index]?.rotation ?? zeroRotation,
        initialRotation: transforms[index]?.rotation,
      };
      return acc;
    }, {} as GamePieceCoordsDict),
  };
};

export const positionHabitatTiles = (gameState: GameState): GamePieceCoordsDict => {
  const transforms = habitatTransforms(hexagonTileXStart, habitatTileYStart);

  return {
    ...gameState.habitatMarket.deck.reduce((acc, habitatTile: HabitatTile, _: number) => {
      acc[habitatTile.uid] = {
        position: transforms[habitatTile.name]?.position ?? zeroPosition,
        initialPosition: transforms[habitatTile.name]?.position,
        rotation: transforms[habitatTile.name]?.rotation ?? zeroRotation,
        initialRotation: transforms[habitatTile.name]?.rotation,
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

export const positionPolicyCards = (gameState: GameState): GamePieceCoordsDict => {
  return {
    ...gameState.policyMarket.table.reduce((acc, card: PolicyCard, index: number) => {
      const xPositions = spreadAroundBase(0, policyCardXOffset, gameState.policyMarket.table.length);
      const position = {
        x: xPositions[index],
        y: marketYStart - cardYOffset + 28,
        z: 20,
      };
      acc[card.uid] = {
        position,
        rotation: zeroRotation,
        initialPosition: position,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
      };
      return acc;
    }, {} as GamePieceCoordsDict),

    ...gameState.policyMarket.acquired.reduce((acc, card: PolicyCard, index: number) => {
      const xPositions = spreadAroundBase(0, policyCardXOffset, gameState.policyMarket.acquired.length);
      const position = {
        x: xPositions[index],
        y: marketYStart - 1.1 * cardYOffset,
        z: 20,
      };
      acc[card.uid] = {
        position,
        rotation: zeroRotation,
        initialPosition: position,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
      };
      return acc;
    }, {} as GamePieceCoordsDict),

    ...gameState.policyMarket.funding.reduce((acc, card: PolicyCard, index: number) => {
      const xPositions = spreadAroundBase(0, cardXOffset, gameState.policyMarket.funding.length);
      const position = {
        x: xPositions[index],
        y: marketYStart - 2.7 * cardYOffset,
        z: 20,
      };
      acc[card.uid] = {
        position,
        rotation: zeroRotation,
        initialPosition: position,
        initialRotation: { x: 0, y: -Math.PI, z: 0 },
      };
      return acc;
    }, {} as GamePieceCoordsDict),
  };
};

export const positionElementMarketCards = (gameState: GameState): GamePieceCoordsDict =>
  ([gameState.turn.borrowedElement, ...gameState.elementMarket.deck].filter(Boolean) as ElementCard[]).reduce(
    (acc, card: ElementCard) => {
      const borrowedRotation = {
        x: 0,
        y: 0,
        z: 0,
      };
      const borrowedOffset = {
        x: 0,
        y: -cardHeight / 8,
        z: 7,
      };
      const deckPosition = positionElementDecks(gameState)[`${card.name}ElementDeck`].position!;
      const isBorrowed = gameState.turn.borrowedElement?.uid === card.uid;

      acc[card.uid] = {
        initialPosition: deckPosition,
        initialRotation: zeroRotation,
        exitPosition: deckPosition,
        exitRotation: zeroRotation,
        ...(isBorrowed
          ? {
              position: {
                x: deckPosition.x + borrowedOffset.x,
                y: deckPosition.y + borrowedOffset.y,
                z: deckPosition.z + borrowedOffset.z,
              },
              rotation: borrowedRotation,
            }
          : undefined),
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
  const acc: GamePieceCoordsDict = {};
  gameState.deck.ordering
    .filter(([name]) => name === "element")[0][1]!
    .map((name, index) => {
      acc[`${name}ElementDeck`] = {
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
    }, {} as GamePieceCoordsDict);

  return acc;
};

export const positionPlayerDecks = (gameState: GameState): GamePieceCoordsDict => {
  return gameState.players.reduce((acc, player, playerIndex) => {
    acc[`${player.uid}PlayerDeck`] = {
      position: supplyDeckPositions(gameState)[playerIndex],
      initialPosition: supplyDeckPositions(gameState)[playerIndex],
      exitPosition: supplyDeckPositions(gameState)[playerIndex],
      rotation: {
        x: 0,
        y: 0,
        z: playerZRotations[playerIndex],
      },
    };
    acc[`${player.uid}PlayerDiscard`] = {
      initialPosition: discardPositions(gameState)[playerIndex],

      position: discardPositions(gameState)[playerIndex],
      rotation: {
        x: 0,
        y: 0,
        z: playerIndex * (Math.PI / 2),
      },
    };
    return acc;
  }, {} as GamePieceCoordsDict);
};

export const positionPlayerCards = (gameState: GameState): GamePieceCoordsDict => {
  return gameState.players.reduce((acc, player, playerIndex) => {
    const deckPosition = supplyDeckPositions(gameState)[playerIndex];
    const discardPosition = discardPositions(gameState)[playerIndex];
    const rotation = { x: 0, y: 0, z: playerZRotations[playerIndex] };
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

    // Use the deck position as the initial position to base the offset off of
    let previousPosition = deckPosition;
    player.hand
      .filter((card) => !exhaustedCards.includes(card.uid))

      .forEach((card: Card) => {
        const inPlay = playedCards.includes(card.uid);
        const offset = getPlayerCardOffset(previousPosition, deckPosition, playerIndex, inPlay, false, false);
        previousPosition = offset;

        acc[card.uid] = {
          position: offset,
          rotation,
          initialRotation: deckRotation,
          initialPosition: deckPosition,
          exitPosition: discardPosition,
          exitRotation: discardRotation,
        };
      });

    // Adds space between available cards and exhausted cards
    previousPosition = {
      ...previousPosition,
      x: playerIndex === 0 || playerIndex === 2 ? previousPosition.x + cardXOffset / 2 : previousPosition.x,
      y: playerIndex === 1 || playerIndex === 3 ? previousPosition.y + cardXOffset / 2 : previousPosition.y,
    };
    player.hand
      .filter((card) => exhaustedCards.includes(card.uid))
      .sort((a, b) => {
        const aIsAnimalOrPlant = a.type === "animal" || a.type === "plant";
        const bIsAnimalOrPlant = b.type === "animal" || b.type === "plant";
        const aHasAbilities =
          aIsAnimalOrPlant && !isEmpty(a.abilities) && !map(gameState.turn.usedAbilities, "source").includes(a.uid);
        const bHasAbilities =
          bIsAnimalOrPlant && !isEmpty(b.abilities) && !map(gameState.turn.usedAbilities, "source").includes(b.uid);

        if (!aIsAnimalOrPlant && bIsAnimalOrPlant) return -1;
        if (aIsAnimalOrPlant && !bIsAnimalOrPlant) return 1;
        if (!aHasAbilities && bHasAbilities) return -1;
        if (aHasAbilities && !bHasAbilities) return 1;

        return 0;
      })
      .forEach((card: Card, cardIndex: number) => {
        const inPlay = playedCards.includes(card.uid);
        const offset = getPlayerCardOffset(
          previousPosition,
          deckPosition,
          playerIndex,
          inPlay,
          true,
          cardIndex !== 0 &&
            (isEmpty((card as AnimalCard).abilities) ||
              map(gameState.turn.usedAbilities, "source").includes(card.uid as AnimalUID | PlantUID) ||
              (card.type !== "animal" && card.type !== "plant")),
        );
        previousPosition = offset;

        acc[card.uid] = {
          position: offset,
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
  previousPosition: Coordinate,
  basePosition: Coordinate,
  playerIndex: number,
  inPlay: boolean,
  exhausted: boolean,
  canOverlap?: boolean,
) => {
  const cardOffset = canOverlap ? overlappingCardXOffset : cardXOffset;
  const inPlayOffset = inPlay ? (playerIndex === 0 || playerIndex === 3 ? 4 : -4) : 0;
  const exhaustedOffset = exhausted ? -cardHeight / 2 : 0;
  const z = previousPosition.z + (exhausted ? cardDepth : 0.1);

  switch (playerIndex) {
    case 0:
      return { x: previousPosition.x + cardOffset, y: basePosition.y + inPlayOffset + exhaustedOffset, z };
    case 1:
      return { x: basePosition.x + inPlayOffset, y: previousPosition.y + cardOffset, z };
    case 2:
      return { x: previousPosition.x + cardOffset, y: basePosition.y + inPlayOffset, z };
    case 3:
      return { x: basePosition.x + inPlayOffset, y: previousPosition.y - cardOffset, z };
    default:
      return { x: 0, y: 0, z: 0 };
  }
};

const spreadAroundBase = (baseX: number, offset: number, numberOfElements: number): number[] => {
  if (numberOfElements === 1) {
    return [baseX];
  }

  const positions: number[] = [];

  if (numberOfElements % 2 === 1) {
    const middleIndex = Math.floor(numberOfElements / 2);
    for (let i = 0; i < numberOfElements; i++) {
      positions.push(baseX + (i - middleIndex) * offset);
    }
  } else {
    const middleLeftIndex = numberOfElements / 2 - 1;
    for (let i = 0; i < numberOfElements; i++) {
      positions.push(baseX + (i - middleLeftIndex - 0.5) * offset);
    }
  }

  return positions;
};
