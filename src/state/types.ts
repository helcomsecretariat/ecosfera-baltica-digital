import {
  AbilityConfig,
  AnimalConfig,
  HabitatConfig,
  DisasterConfig,
  ElementConfig,
  ExtinctionConfig,
  PlantConfig,
  DeckConfig,
  PolicyConfig,
} from "@/decks/schema";
import { ExpansionPackStageEvent } from "./machines/expansion";

// google "bradned types in TS" for explanation
export type UID<T extends string> = `${T}-${string}` & { readonly __brand: `${T}UID` };
export type AbilityUID = UID<"ability">;
export type AnimalUID = UID<"animal">;
export type PlantUID = UID<"plant">;
export type PolicyUID = UID<"policy">;
export type ElementUID = UID<"element">;
export type DisasterUID = UID<"disaster">;
export type HabitatUID = UID<"habitat">;
export type ExtinctionUID = UID<"extinction">;
export type PlayerUID = UID<"player">;
export type GamePieceUID = AbilityUID | AnimalUID | PlantUID | ElementUID | DisasterUID | HabitatUID | ExtinctionUID;
export type CardOrTileUID = Card["uid"] | HabitatUID | ExtinctionUID;

export function isAbilityUID(uid: string): uid is AbilityUID {
  return uid.startsWith("ability-");
}
export function isAnimalUID(uid: string): uid is AnimalUID {
  return uid.startsWith("animal-");
}
export function isPlantUID(uid: string): uid is PlantUID {
  return uid.startsWith("plant-");
}
export function isElementUID(uid: string): uid is ElementUID {
  return uid.startsWith("element-");
}
export function isDisasterUID(uid: string): uid is DisasterUID {
  return uid.startsWith("disaster-");
}
export function isHabitatUID(uid: string): uid is HabitatUID {
  return uid.startsWith("habitat-");
}
export function isExtinctionUID(uid: string): uid is ExtinctionUID {
  return uid.startsWith("extinction-");
}
export function isPlayerUID(uid: string): uid is PlayerUID {
  return uid.startsWith("player-");
}

export interface GameState {
  turn: {
    player: PlayerState["uid"];
    currentAbility?: {
      piece: AbilityTile | PlantCard | AnimalCard;
      name: AbilityName;
      targetCard?: Card | undefined;
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
    refreshedAbilityUids: AbilityUID[];
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
  policyMarket: PolicyMarket;
  policyFunding: number;
  activePolicyCards: PolicyCard[];
  stage?: {
    terminationEvent?: boolean;
    eventType: StageEventType;
    cause: CardOrTileUID[] | undefined;
    effect: CardOrTileUID[] | undefined;
    outcome: "positive" | "negative";
  };
  commandBar?: {
    text: string;
  };
  config: GameConfig;
  deck: DeckConfig;
  statistics: GameStateStatistics;
}

export type GameStateStatistics = {
  animalsBought: number;
  plantsBought: number;
};

export type StageEventType =
  | "disaster"
  | "elementalDisaster"
  | "extinction"
  | "massExtinction"
  | "abilityRefresh"
  | "habitatUnlock"
  | "cardBuy"
  | "gameLoss"
  | "gameWin"
  | ExpansionPackStageEvent;

export interface GameConfig {
  seed: string;
  playerCount: number;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  useSpecialCards: boolean;
  playersPosition: "around" | "sameSide";
  playerNames: string[];
}

export interface PlayerState {
  uid: PlayerUID;
  name: string;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  abilities: AbilityTile[];
}

export interface AbilityTile extends GamePieceBase {
  type: "ability";
  uid: AbilityUID;
  isUsed: boolean;

  name: AbilityName;
}

export type HabitatName = "coast" | "ice" | "rivers" | "pelagic" | "mud" | "rock" | "baltic";
export interface HabitatTile extends GamePieceBase {
  type: "habitat";
  isAcquired: boolean;
  uid: HabitatUID;
  name: HabitatName;
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

export type Card = AnimalCard | PlantCard | ElementCard | DisasterCard | PolicyCard;
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
              : T extends PolicyCard
                ? PolicyConfig
                : never;

export interface Market<T extends GamePiece> {
  type: T["type"];
  deck: T[];
  table: T[];
}

export interface PolicyMarket extends Market<PolicyCard> {
  type: PolicyCard["type"];
  deck: PolicyCard[];
  table: PolicyCard[];
  acquired: PolicyCard[];
}

export interface AnimalCard extends GamePieceBase {
  type: "animal";
  uid: AnimalUID;

  habitats: HabitatTile["name"][];
  abilities: AbilityName[];
}

export type PolicyEffect = "positive" | "negative" | "dual" | "implementation";
export type PolicyTheme = "hazard" | "eutro" | "climateChange" | "N/A";
export type PolicyUsage = "single" | "permanent";

export interface PolicyCard extends GamePieceBase {
  type: "policy";
  uid: PolicyUID;

  effect: PolicyEffect;
  theme: PolicyTheme;
  description: string;
  usage: PolicyUsage;
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
export type CardType = "animal" | "plant" | "disaster" | "element" | "policy";
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
};

type PresentPieceTransform = {
  position: Coordinate;
  rotation: Coordinate;
  initialPosition?: Coordinate;
  initialRotation?: Coordinate;
  exitPosition?: Coordinate;
  exitRotation?: Coordinate;
};

type PositionIndependent = {
  position?: undefined;
  rotation?: undefined;
};

export type GamePieceTransform = (AbsentPieceTransform & PositionIndependent) | PresentPieceTransform;

export interface GamePieceDisplay {
  visibility?: "default" | "highlighted" | "dimmed" | "hidden";
}

export type GamePieceAppearance = GamePieceTransform & {
  duration: number;
  delay: number;
  doesFlip?: boolean;
};

export type EntitityRenderKey = GamePiece["uid"] | `${string}Deck` | `${string}Discard` | `${string}AbilityTokens`;
export interface GamePieceAppearances {
  [key: EntitityRenderKey]: GamePieceAppearance;
}
export interface GamePieceCoordsDict {
  [key: EntitityRenderKey]: GamePieceTransform;
}

export interface UiState {
  cardPositions: GamePieceAppearances;
  deckPositions: GamePieceAppearances;
}
