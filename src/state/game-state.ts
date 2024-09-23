// import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import type { DeckConfig } from "@/decks/schema";
import type {
  GamePiece,
  GamePieceBase,
  GameState,
  Market,
  PieceToConfig,
  PlayerState,
} from "./types";
import { shuffle } from "./utils";
import { Croupier } from "./croupier";
import { entries, find, pull, without } from "lodash-es";

function spawnAllPieces<T extends GamePiece>(
  items: Record<string, PieceToConfig<T>>,
  spawner: (name: string, config: PieceToConfig<T>) => T[],
): T[] {
  return Object.entries(items).flatMap(([name, config]) =>
    spawner(name, config),
  );
}

function prepareMarket<T extends GamePieceBase>(
  items: T[],
  initialTableSize = 0,
  seed: string,
): Market<T> {
  const deck = shuffle(items, seed + items[0].uid);
  const table = deck.slice(0, initialTableSize);

  return {
    type: deck[0].type,
    deck: without(deck, ...table),
    table,
  };
}

export function spawnDeck(
  config: DeckConfig,
  playerCount = 1,
  seed?: string,
): GameState {
  seed = seed ?? Math.random().toString(36);
  const croupier = new Croupier();

  const plants = spawnAllPieces(
    config.plants,
    croupier.spawnPlantCards.bind(croupier),
  );
  const animals = spawnAllPieces(
    config.animals,
    croupier.spawnAnimalCards.bind(croupier),
  );
  const elements = spawnAllPieces(
    config.elements,
    croupier.spawnElementCards.bind(croupier),
  );
  const biomes = spawnAllPieces(
    config.biomes,
    croupier.spawnBiomeTiles.bind(croupier),
  );
  const disasters = spawnAllPieces(
    config.disasters,
    croupier.spawnDisasterCards.bind(croupier),
  );
  const extinctions = spawnAllPieces(
    config.extinctions,
    croupier.spawnExtinctionTiles.bind(croupier),
  );

  const players = Array(playerCount)
    .fill(null)
    .map(() => {
      const deck = [
        ...entries(config.per_player.elements).flatMap(
          ([name, { count = 1 }]) =>
            Array(count)
              .fill(1)
              .map(() => find(elements, { name })),
        ),
        ...entries(config.per_player.disasters).flatMap(
          ([name, { count = 1 }]) =>
            Array(count)
              .fill(1)
              .map(() => find(disasters, { name })),
        ),
      ].filter((a) => a !== undefined);

      return {
        deck,
        hand: [],
        discard: [],
        ability: spawnAllPieces(
          config.per_player.abilities,
          croupier.spawnAbilityTiles.bind(croupier),
        ),
      } as PlayerState;
    });

  players.forEach(({ deck }) => {
    pull(elements, ...deck);
    pull(disasters, ...deck);
  });

  return {
    players,
    plantMarket: prepareMarket(plants, 4, seed),
    animalMarket: prepareMarket(animals, 4, seed),
    elementMarket: prepareMarket(elements, 0, seed),
    extinctMarket: prepareMarket(extinctions, 0, seed),
    biomeMarket: prepareMarket(biomes, 0, seed),
    disasterMarket: prepareMarket(disasters, 0, seed),
  };
}
