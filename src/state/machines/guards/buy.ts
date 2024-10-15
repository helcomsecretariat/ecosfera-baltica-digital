import { AbilityTile, AnimalCard, BiomeTile, Card, ElementCard, GameState, PlantCard } from "@/state/types";
import { countBy, find, compact, every } from "lodash";
import { getAnimalBiomePairs } from "../helpers/turn";

export const BuyMachineGuards = {
  canBuyCard: ({ context: { players, turn } }: { context: GameState }, card: AnimalCard | PlantCard) => {
    if (card.type === "plant") {
      const elementsCounted = countBy(card.elements);
      const player = find(players, { uid: turn.player })!;
      const playedElements =
        compact([...player.hand, turn.borrowedElement])
          .filter(({ uid }) => turn.playedCards.includes(uid) || turn.borrowedElement?.uid === uid)
          .filter(({ type }) => type === "element") ?? [];
      const playedElementsCounted = countBy(playedElements, "name");

      return every(elementsCounted, (count, element) => playedElementsCounted[element] >= count);
    }

    if (card.type === "animal") {
      const requiredBiomes = card.biomes;
      const playedPlants =
        (find(players, { uid: turn.player })
          ?.hand.filter(({ uid }) => turn.playedCards.includes(uid))
          .filter(({ type }) => type === "plant") as PlantCard[]) ?? [];

      return playedPlants.filter(({ biomes }) => requiredBiomes.every((b) => biomes.includes(b))).length >= 2;
    }

    return false;
  },

  belowBorrowLimit: ({ context: { turn } }: { context: GameState }) => turn.borrowedCount < turn.borrowedLimit,
  playerHasElement: ({ context }: { context: GameState }, elName: ElementCard["name"]) => {
    const { turn, players } = context;
    const player = find(players, { uid: turn.player })!;
    return player.hand.some(({ name }) => name === elName);
  },

  notPlayedCard: (
    {
      context: {
        turn: { playedCards, exhaustedCards },
      },
    }: { context: GameState },
    uid: Card["uid"],
  ) => ![...playedCards, ...exhaustedCards].includes(uid),

  ownsCard: (
    {
      context: {
        turn: { player },
        players,
      },
    }: { context: GameState },
    uid: Card["uid"],
  ) => find(players, { uid: player })?.hand.some((playerCard) => playerCard.uid === uid) ?? false,

  notExhausted: (
    {
      context: {
        turn: { exhaustedCards },
      },
    }: { context: GameState },
    uid: Card["uid"],
  ) => !exhaustedCards.includes(uid),

  canBuyHabitat: ({ context: { turn, players } }: { context: GameState }, tile: BiomeTile) => {
    const { playedCards, player } = turn;

    const playedAnimals =
      (find(players, { uid: player })
        ?.hand.filter(({ uid }) => playedCards.includes(uid))
        .filter(({ type }) => type === "animal") as AnimalCard[]) ?? [];

    return playedAnimals.filter(({ biomes }) => biomes.includes(tile.name)).length >= 2;
  },

  abilityAvailable: (_: { context: GameState }, token: AbilityTile) => {
    return !token.isUsed;
  },

  getsDisaster: ({ context: { turn } }: { context: GameState }) => {
    const { boughtPlant, boughtAnimal, boughtHabitat } = turn;

    return !boughtPlant && !boughtAnimal && !boughtHabitat;
  },

  getsExtinction: ({ context: { players, turn } }: { context: GameState }) => {
    const player = players.find(({ uid }) => uid === turn.player)!;

    return player.hand.filter((card) => card.type === "disaster").length > 2;
  },

  canRefreshAbility: ({ context }: { context: GameState }) => {
    const player = find(context.players, { uid: context.turn.player })!;
    const availableAnimalBiomePairs = getAnimalBiomePairs(player).filter(
      (animalBiomePair) =>
        !context.turn.uidsUsedForAbilityRefresh.some((uid) =>
          animalBiomePair.map((animal) => animal.uid).includes(uid),
        ),
    );

    return availableAnimalBiomePairs.length > 0;
  },
};
