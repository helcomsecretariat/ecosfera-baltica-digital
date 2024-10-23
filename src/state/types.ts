import {
  AbilityConfig,
  AnimalConfig,
  HabitatConfig,
  DisasterConfig,
  ElementConfig,
  ExtinctionConfig,
  PlantConfig,
} from "@/decks/schema";

// google "bradned types in TS" for explanation
export type UID<T extends string> = `${T}-${string}` & { readonly __brand: `${T}UID` };
export type AbilityUID = UID<"ability">;
export type AnimalUID = UID<"animal">;
export type PlantUID = UID<"plant">;
export type ElementUID = UID<"element">;
export type DisasterUID = UID<"disaster">;
export type HabitatUID = UID<"habitat">;
export type ExtinctionUID = UID<"extinction">;
export type PlayerUID = UID<"player">;
export type GamePieceUID = AbilityUID | AnimalUID | PlantUID | ElementUID | DisasterUID | HabitatUID | ExtinctionUID;

export interface GameState {
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
    unlockedHabitat: boolean;
    uidsUsedForAbilityRefresh: AnimalUID[];
    selectedAbilityCard?: PlantCard | AnimalCard;
    automaticEventChecks?: string[];
    phase: "draw" | "end" | "action";
  };
  players: PlayerState[];
  plantMarket: Market<PlantCard>;
  animalMarket: Market<AnimalCard>;
  elementMarket: Market<ElementCard>;
  disasterMarket: Market<DisasterCard>;
  habitatMarket: Market<HabitatTile>;
  extinctMarket: Market<ExtinctionTile>;
  stage?: {
    eventType: "disaster" | "elementalDisaster" | "extinction" | "massExtinction" | "abilityRefresh" | "habitatUnlock";
    cause: DisasterCard[] | ElementCard[] | AnimalCard[] | undefined;
    effect: DisasterCard[] | ExtinctionTile[] | HabitatTile[] | undefined;
  };
  config: GameConfig;
}

export interface GameConfig {
  seed: string;
  playerCount: number;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  useSpecialCards: boolean;
  playersPosition: "around" | "sameSide";
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

export interface HabitatTile extends GamePieceBase {
  type: "habitat";
  isAcquired: boolean;
  uid: HabitatUID;
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
export type GamePiece = Card | HabitatTile | ExtinctionTile | AbilityTile;

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
          : T extends HabitatConfig
            ? HabitatTile
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
          : T extends HabitatTile
            ? HabitatConfig
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

  habitats: HabitatTile["name"][];
  abilities: AbilityName[];
}

export interface PlantCard extends GamePieceBase {
  type: "plant";
  uid: PlantUID;

  habitats: HabitatTile["name"][];
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
export type GamePieceType = CardType | "habitat" | "ability" | "extinction";

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
  doesFlip?: boolean;
};

export interface GamePieceAppearances {
  [key: GamePiece["uid"] | `${string}Deck` | `${string}Discard`]: GamePieceAppearance;
}
export interface GamePieceCoordsDict {
  [key: GamePiece["uid"] | `${string}Deck` | `${string}Discard`]: GamePieceCoords;
}

export interface UiState {
  cardPositions: GamePieceAppearances;
  deckPositions: GamePieceAppearances;
}
