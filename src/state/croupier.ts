import type {
  AbilityConfig,
  AnimalConfig,
  BiomeConfig,
  DisasterConfig,
  ElementConfig,
  ExtinctionConfig,
  PlantConfig,
} from "@/decks/schema";
import { AbilityTile, AnimalCard, BiomeTile, DisasterCard, ElementCard, ExtinctionTile, PlantCard } from "./types";

export class Croupier {
  private uid = 0;

  private nextUid() {
    return "" + this.uid++;
  }

  spawnAbilityTiles(name: string, config: AbilityConfig): AbilityTile[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "ability",
      is_used: false,
      uid: this.nextUid(),
    }));
  }

  spawnAnimalCards(name: string, config: AnimalConfig): AnimalCard[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "animal",
      uid: this.nextUid(),
      biomes: config.biomes,
      abilities: config.abilities,
    }));
  }

  spawnPlantCards(name: string, config: PlantConfig): PlantCard[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "plant",
      uid: this.nextUid(),
      biomes: config.biomes,
      abilities: config.abilities,
      elements: config.elements,
    }));
  }

  spawnElementCards(name: string, config: ElementConfig): ElementCard[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "element",
      uid: this.nextUid(),
    }));
  }

  spawnDisasterCards(name: string, config: DisasterConfig): DisasterCard[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "disaster",
      uid: this.nextUid(),
    }));
  }

  spawnBiomeTiles(name: string, config: BiomeConfig): BiomeTile[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "biome",
      uid: this.nextUid(),
    }));
  }

  spawnExtinctionTiles(name: string, config: ExtinctionConfig): ExtinctionTile[] {
    return Array.from(Array(config.count ?? 1), () => ({
      name,
      type: "extinction",
      uid: this.nextUid(),
    }));
  }
}
