import type {
  AbilityConfig,
  AnimalConfig,
  BiomeConfig,
  DeckConfig,
  DisasterConfig,
  ExtinctionConfig,
  PlantConfig,
} from "@/decks/schema";
import {
  AbilityTile,
  AnimalCard,
  BiomeTile,
  DisasterCard,
  ElementCard,
  ExtinctionTile,
  GameConfig,
  PlantCard,
} from "./types";
import { createUID } from "@/state/utils";

export class Croupier {
  private uid = 0;
  private deckConfig: DeckConfig;
  private gameConfig: GameConfig;

  constructor(deckConfig: DeckConfig, gameConfig: GameConfig) {
    this.deckConfig = deckConfig;
    this.gameConfig = gameConfig;
  }

  private nextUid() {
    return "" + this.uid++;
  }

  spawnAbilityTiles(name: AbilityConfig["name"], config: AbilityConfig): AbilityTile[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      isUsed: false,
      type: "ability",
      uid: `ability-${this.nextUid()}` as AbilityTile["uid"],
    }));
  }

  spawnAnimalCards(name: string, config: AnimalConfig): AnimalCard[] {
    const abilities = this.gameConfig.useSpecialCards
      ? config.abilities
      : config.abilities.filter((a) => a !== "special");
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "animal",
      biomes: config.biomes,
      abilities,
      uid: `animal-${this.nextUid()}` as AnimalCard["uid"],
    }));
  }

  spawnPlantCards(name: string, config: PlantConfig): PlantCard[] {
    const abilities = this.gameConfig.useSpecialCards
      ? config.abilities
      : config.abilities.filter((a) => a !== "special");
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "plant",
      biomes: config.biomes,
      abilities,
      elements: config.elements,
      uid: `plant-${this.nextUid()}` as PlantCard["uid"],
    }));
  }

  spawnElementCards(name: string): ElementCard[] {
    const difficultyCount = 9 - this.gameConfig.difficulty;
    const perUserCount = (this.deckConfig.per_player.elements[name].count as number) ?? 1;
    const totalCount = difficultyCount + perUserCount * this.gameConfig.playerCount;
    return Array.from(Array(totalCount), () => ({
      name,
      type: "element",
      uid: `element-${this.nextUid()}` as ElementCard["uid"],
    }));
  }

  spawnDisasterCards(name: string, config: DisasterConfig): DisasterCard[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "disaster",
      uid: `disaster-${this.nextUid()}` as DisasterCard["uid"],
    }));
  }

  spawnBiomeTiles(name: string, config: BiomeConfig): BiomeTile[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "biome",
      isAcquired: false,
      // uid: `biome-${this.nextUid()}` as BiomeTile["uid"],
      uid: createUID("biome", this.nextUid()),
    }));
  }

  spawnExtinctionTiles(name: string, config: ExtinctionConfig): ExtinctionTile[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "extinction",
      uid: `extinction-${this.nextUid()}` as ExtinctionTile["uid"],
    }));
  }
}
