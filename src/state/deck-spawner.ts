import type { DeckConfig } from "@/decks/schema";
import type { GameConfig, GamePiece, GameState, Market, PieceToConfig, PlayerState } from "./types";
import { shuffle } from "./utils";
import { Croupier } from "./croupier";
import { entries, filter, pull, without } from "lodash-es";
import { getCardComparator } from "@/lib/utils";

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

export function spawnDeck(deckConfig: DeckConfig, gameConfig: GameConfig): GameState {
  const { seed, playerCount } = gameConfig;
  const croupier = new Croupier(deckConfig, gameConfig);

  const policies = shuffle(spawnAllPieces(deckConfig.policies, croupier.spawnPolicyCards.bind(croupier)), seed);
  const disasters = shuffle(spawnAllPieces(deckConfig.disasters, croupier.spawnDisasterCards.bind(croupier)), seed);

  const plants = spawnAllPieces(deckConfig.plants, croupier.spawnPlantCards.bind(croupier));
  const animals = spawnAllPieces(deckConfig.animals, croupier.spawnAnimalCards.bind(croupier));
  const elements = spawnAllPieces(deckConfig.elements, croupier.spawnElementCards.bind(croupier));
  const habitats = spawnAllPieces(deckConfig.habitats, croupier.spawnHabitatTiles.bind(croupier));
  const extinctions = spawnAllPieces(deckConfig.extinctions, croupier.spawnExtinctionTiles.bind(croupier));

  const players = Array(playerCount)
    .fill(null)
    .map((_, index) => {
      let deck = [
        ...entries(deckConfig.per_player.elements).flatMap(([name, { count = 1 }]) =>
          // @ts-expect-error TS can't figure out count is a number
          filter(elements, { name }).slice(0, count),
        ),
        ...entries(deckConfig.per_player.disasters).flatMap(([name, { count = 1 }]) =>
          // @ts-expect-error TS con't figure out count is a number
          filter(disasters, { name }).slice(0, count),
        ),
      ].filter((a) => a !== undefined);

      deck = shuffle(deck, seed + index);
      const hand = deck.slice(0, 4).sort(getCardComparator(deckConfig.ordering));

      pull(elements, ...deck);
      pull(disasters, ...deck);

      return {
        uid: `player-${index}` as PlayerState["uid"],
        name: gameConfig.playerNames[index],
        deck: without(deck, ...hand),
        hand,
        discard: [],
        abilities: spawnAllPieces(deckConfig.per_player.abilities, croupier.spawnAbilityTiles.bind(croupier)),
      } as PlayerState;
    });

  return {
    turn: {
      player: players[0].uid,
      currentAbility: undefined,
      exhaustedCards: [],
      playedCards: [],
      borrowedElement: undefined,
      usedAbilities: [],
      boughtAnimal: false,
      boughtPlant: false,
      unlockedHabitat: false,
      uidsUsedForAbilityRefresh: [],
      refreshedAbilityUids: [],
      phase: "action",
    },
    blockers: {
      ability: {
        isBloked: false,
        reasons: [],
      },
      turn: {
        isBloked: false,
        reasons: [],
      },
    },
    players,
    plantMarket: prepareMarket(plants, 4, seed),
    animalMarket: prepareMarket(animals, 4, seed),
    elementMarket: prepareMarket(elements, 0, seed),
    extinctMarket: prepareMarket(extinctions, 0, seed),
    habitatMarket: prepareMarket(habitats, 0, seed),
    disasterMarket: prepareMarket(disasters, 0, seed),
    policyMarket: { ...prepareMarket(policies, 0, seed), acquired: [], funding: [], active: [] },
    stage: undefined,
    config: gameConfig,
    deck: deckConfig,
    statistics: {
      animalsBought: 0,
      plantsBought: 0,
    },
  };
}
