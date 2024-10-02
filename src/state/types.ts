import {
  AbilityConfig,
  AnimalConfig,
  BiomeConfig,
  DisasterConfig,
  ElementConfig,
  ExtinctionConfig,
  PlantConfig,
} from "@/decks/schema";

export interface GameState {
  players: PlayerState[];
  plantMarket: Market<PlantCard>;
  animalMarket: Market<AnimalCard>;
  elementMarket: Market<ElementCard>;
  disasterMarket: Market<DisasterCard>;
  biomeMarket: Market<BiomeTile>;
  extinctMarket: Market<ExtinctionTile>;
}

export interface PlayerState {
  uid: string;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  ability: AbilityTile[];
}

export interface AbilityTile extends GamePieceBase {
  type: "ability";
}

export interface BiomeTile extends GamePieceBase {
  type: "biome";
}

export interface ExtinctionTile extends GamePieceBase {
  type: "extinction";
}

export interface GamePieceBase {
  name: string;
  type: GamePieceType;
  uid: string;
}

export type Card = AnimalCard | PlantCard | ElementCard | DisasterCard;
export type GamePiece = Card | BiomeTile | ExtinctionTile | AbilityTile;

export type PositionedCard = Card & { x: number; y: number };
export type ConfigToPiece<T> = T extends PlantConfig
  ? PlantCard
  : T extends AnimalConfig
    ? AnimalCard
    : T extends ElementConfig
      ? ElementCard
      : T extends DisasterConfig
        ? DisasterCard
        : T extends AbilityConfig
          ? AbilityTile
          : T extends BiomeConfig
            ? BiomeTile
            : T extends ExtinctionConfig
              ? ExtinctionTile
              : never;
export type PieceToConfig<T> = T extends PlantCard
  ? PlantConfig
  : T extends AnimalCard
    ? AnimalConfig
    : T extends ElementCard
      ? ElementConfig
      : T extends DisasterCard
        ? DisasterConfig
        : T extends AbilityTile
          ? AbilityConfig
          : T extends BiomeTile
            ? BiomeConfig
            : T extends ExtinctionTile
              ? ExtinctionConfig
              : never;

export interface Market<T extends GamePiece> {
  type: T["type"];
  deck: T[];
  table: T[];
}

export interface AnimalCard extends GamePieceBase {
  type: "animal";
  biomes: string[];
  abilities: AbilityName[];
}

export interface PlantCard extends GamePieceBase {
  type: "plant";
  biomes: string[];
  abilities: AbilityName[];
  elements: string[];
}

export interface ElementCard extends GamePieceBase {
  type: "element";
}

export interface DisasterCard extends GamePieceBase {
  type: "disaster";
}

export type AbilityName = "plus" | "refresh" | "move" | "special";
export type CardType = "animal" | "plant" | "disaster" | "element";
export type GamePieceType = CardType | "biome" | "ability" | "extinction";
