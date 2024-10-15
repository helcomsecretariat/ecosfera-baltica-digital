import type { DeckConfig } from "@/decks/schema";
import type { GamePiece, GameState, Market, PieceToConfig, PlayerState } from "./types";
import { shuffle } from "./utils";
import { Croupier } from "./croupier";
import { entries, filter, pull, without } from "lodash-es";

function spawnAllPieces<T extends GamePiece>(
  items: Record<T["name"], PieceToConfig<T>>,
  spawner: (name: T["name"], config: PieceToConfig<T>) => T[],
): T[] {
  return Object.entries(items).flatMap(([name, config]) => spawner(name, config as PieceToConfig<T>));
}

function prepareMarket<T extends GamePiece>(items: T[], initialTableSize = 0, seed: string): Market<T> {
  const deck = shuffle(items, seed + items[0].uid);
  const table = deck.slice(0, initialTableSize);

  return {
    type: deck[0].type,
    deck: without(deck, ...table),
    table,
  };
}

export function spawnDeck(config: DeckConfig, playerCount = 1, seed: string): GameState {
  const croupier = new Croupier();

  const plants = spawnAllPieces(config.plants, croupier.spawnPlantCards.bind(croupier));
  const animals = spawnAllPieces(config.animals, croupier.spawnAnimalCards.bind(croupier));
  const elements = spawnAllPieces(config.elements, croupier.spawnElementCards.bind(croupier));
  const biomes = spawnAllPieces(config.biomes, croupier.spawnBiomeTiles.bind(croupier));
  const disasters = spawnAllPieces(config.disasters, croupier.spawnDisasterCards.bind(croupier));
  const extinctions = spawnAllPieces(config.extinctions, croupier.spawnExtinctionTiles.bind(croupier));

  const players = Array(playerCount)
    .fill(null)
    .map((_, index) => {
      let deck = [
        ...entries(config.per_player.elements).flatMap(([name, { count = 1 }]) =>
          // @ts-expect-error TS con't figure out count is a number
          filter(elements, { name }).slice(0, count),
        ),
        ...entries(config.per_player.disasters).flatMap(([name, { count = 1 }]) =>
          // @ts-expect-error TS con't figure out count is a number
          filter(disasters, { name }).slice(0, count),
        ),
      ].filter((a) => a !== undefined);

      deck = shuffle(deck, seed + index);
      const hand = deck.slice(0, 4);

      pull(elements, ...deck);
      pull(disasters, ...deck);

      return {
        uid: `player-${index}` as PlayerState["uid"],
        deck: without(deck, ...hand),
        hand,
        discard: [],
        abilities: spawnAllPieces(config.per_player.abilities, croupier.spawnAbilityTiles.bind(croupier)),
      } as PlayerState;
    });

  return {
    seed,
    turn: {
      player: players[0].uid,
      currentAbility: undefined,
      exhaustedCards: [],
      playedCards: [],
      borrowedElement: undefined,
      usedAbilities: [],
      borrowedCount: 0,
      borrowedLimit: 1,
      boughtAnimal: false,
      boughtPlant: false,
      boughtHabitat: false,
      uidsUsedForAbilityRefresh: [],
    },
    players,
    plantMarket: prepareMarket(plants, 4, seed),
    animalMarket: prepareMarket(animals, 4, seed),
    elementMarket: prepareMarket(elements, 0, seed),
    extinctMarket: prepareMarket(extinctions, 0, seed),
    biomeMarket: prepareMarket(biomes, 0, seed),
    disasterMarket: prepareMarket(disasters, 0, seed),
  };
}
