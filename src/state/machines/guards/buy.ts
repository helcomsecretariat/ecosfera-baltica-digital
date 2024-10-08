import { AnimalCard, BiomeTile, Card, GameState, PlantCard } from "@/state/types";
import { countBy, find, compact, every, intersection } from "lodash";

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

      return playedPlants.filter(({ biomes }) => intersection(biomes, requiredBiomes).length > 0).length >= 2;
    }

    return false;
  },

  canBorrow: ({ context: { turn } }: { context: GameState }) => turn.borrowedCount < turn.borrowedLimit,

  notPlayedCard: (
    {
      context: {
        turn: { playedCards },
      },
    }: { context: GameState },
    uid: Card["uid"],
  ) => !playedCards.includes(uid),

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
};
