import type {
  AbilityConfig,
  AnimalConfig,
  DeckConfig,
  HabitatConfig,
  DisasterConfig,
  ExtinctionConfig,
  PlantConfig,
} from "@/decks/schema";
import {
  AbilityTile,
  AnimalCard,
  DisasterCard,
  ElementCard,
  ExtinctionTile,
  GameConfig,
  HabitatTile,
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
      habitats: config.habitats,
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
      habitats: config.habitats,
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

  spawnHabitatTiles(name: string, config: HabitatConfig): HabitatTile[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "habitat",
      isAcquired: false,
      // uid: `habitat-${this.nextUid()}` as HabitatTile["uid"],
      uid: createUID("habitat", this.nextUid()),
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
