import {
  AbilityConfig,
  AnimalConfig,
  BiomeConfig,
  DisasterConfig,
  ElementConfig,
  ExtinctionConfig,
  PlantConfig,
} from "@/decks/schema";

// google "bradned types in TS" for explanation
export type AbilityUID = `${"ability-"}${string}` & { readonly __brand: "AbilityUID" };
export type AnimalUID = `${"animal-"}${string}` & { readonly __brand: "AnimalUID" };
export type PlantUID = `${"plant-"}${string}` & { readonly __brand: "PlantUID" };
export type ElementUID = `${"element-"}${string}` & { readonly __brand: "ElementUID" };
export type DisasterUID = `${"disaster-"}${string}` & { readonly __brand: "DisasterUID" };
export type BiomeUID = `${"biome-"}${string}` & { readonly __brand: "BiomeUID" };
export type ExtinctionUID = `${"extinction-"}${string}` & { readonly __brand: "ExtinctionUID" };
export type PlayerUID = `${"player-"}${string}` & { readonly __brand: "PlayerUID" };
export type GamePieceUID = AbilityUID | AnimalUID | PlantUID | ElementUID | DisasterUID | BiomeUID | ExtinctionUID;

export interface GameState {
  seed: string;
  turn: {
    player: PlayerState["uid"];
    currentAbility?: {
      piece: AbilityTile | PlantCard | AnimalCard;
      name: AbilityName;
    };
    exhaustedCards: Card["uid"][];
    playedCards: Card["uid"][];
    borrowedElement: ElementCard | undefined;
    borrowedCount: number;
    borrowedLimit: number;
    usedAbilities: { source: (AbilityTile | PlantCard | AnimalCard)["uid"]; name: AbilityName }[];
    boughtAnimal: boolean;
    boughtPlant: boolean;
    boughtHabitat: boolean;
    uidsUsedForAbilityRefresh: AnimalUID[];
  };
  players: PlayerState[];
  plantMarket: Market<PlantCard>;
  animalMarket: Market<AnimalCard>;
  elementMarket: Market<ElementCard>;
  disasterMarket: Market<DisasterCard>;
  biomeMarket: Market<BiomeTile>;
  extinctMarket: Market<ExtinctionTile>;
}

export interface PlayerState {
  uid: PlayerUID;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  abilities: AbilityTile[];
}

export interface AbilityTile extends GamePieceBase {
  type: "ability";
  uid: AbilityUID;
  isUsed: boolean;

  name: "move" | "refresh" | "plus" | "special";
}

export interface BiomeTile extends GamePieceBase {
  type: "biome";
  isAcquired: boolean;
  uid: BiomeUID;
}

export interface ExtinctionTile extends GamePieceBase {
  type: "extinction";
  uid: ExtinctionUID;
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
  uid: AnimalUID;

  biomes: BiomeTile["name"][];
  abilities: AbilityName[];
}

export interface PlantCard extends GamePieceBase {
  type: "plant";
  uid: PlantUID;

  biomes: BiomeTile["name"][];
  abilities: AbilityName[];
  elements: ElementCard["name"][];
}

export interface ElementCard extends GamePieceBase {
  type: "element";
  uid: ElementUID;
}

export interface DisasterCard extends GamePieceBase {
  type: "disaster";
  uid: DisasterUID;
}

export type AbilityName = "plus" | "refresh" | "move" | "special";
export type CardType = "animal" | "plant" | "disaster" | "element";
export type GamePieceType = CardType | "biome" | "ability" | "extinction";

export interface Coordinate {
  x: number;
  y: number;
  z: number;
}

export type AbsentPieceTransform = {
  initialPosition: Coordinate;
  initialRotation: Coordinate;
  exitPosition: Coordinate;
  exitRotation: Coordinate;
  position: never;
  rotation: never;
  distance?: number;
  duration?: number;
};

type PresentPieceTransform = {
  position: Coordinate;
  rotation: Coordinate;
  initialPosition?: Coordinate;
  initialRotation?: Coordinate;
  exitPosition?: Coordinate;
  exitRotation?: Coordinate;
};

export type GamePieceTransform = AbsentPieceTransform | PresentPieceTransform;

export interface GamePieceDisplay {
  visibility?: "default" | "highlighted" | "dimmed" | "hidden";
}

export type GamePieceCoords = {
  transform: GamePieceTransform;
  display?: GamePieceDisplay;
};

export type GamePieceAppearance = GamePieceCoords & {
  duration: number;
  delay: number;
};

export interface GamePieceAppearances {
  [key: Card["uid"] | `${string}Deck` | `${string}Discard`]: GamePieceAppearance;
}
export interface GamePieceCoordsDict {
  [key: Card["uid"] | `${string}Deck` | `${string}Discard`]: GamePieceCoords;
}

export interface UiState {
  cardPositions: GamePieceAppearances;
  deckPositions: GamePieceAppearances;
}
