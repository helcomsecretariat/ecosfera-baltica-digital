import { baseDuration } from "@/constants/animation";
import { Card, Coordinate, FaunaType, GamePieceAppearance, GameState, PlayerState, UID } from "@/state/types";
import { find, isMatch } from "lodash-es";

// algorith need a lenghty seed to work somewhat OK
// so prefix is used to garantee that the seed is long enough
const SEED_PREFIX = "PHd6HpwslW7Q";

export function shuffle<T>(items: T[], seed: string): T[] {
  const random = rng(SEED_PREFIX + seed);

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

export function rng(seed = "") {
  let x = 0;
  let y = 0;
  let z = 0;
  let w = 0;

  function next() {
    const t = x ^ (x << 11);
    x = y;
    y = z;
    z = w;
    w ^= ((w >>> 19) ^ t ^ (t >>> 8)) >>> 0;
    return (w >>> 0) / 0x100000000; // Ensure w is treated as an unsigned 32-bit integer
  }

  for (let k = 0; k < seed.length + 64; k++) {
    x ^= seed.charCodeAt(k) | 0;
    next();
  }

  return next;
}

export function replaceItem<T extends object>(predicate: Partial<T>, newItem: T, items: T[]): T[] {
  return items.map((item) => (isMatch(item, predicate) ? newItem : item));
}

export function assignItem<T extends object, U extends Partial<T>>(predicate: Partial<T>, changes: U, items: T[]): T[] {
  return items.map((item) => (isMatch(item, predicate) ? { ...item, ...changes } : item));
}

export function findOwner(state: GameState, card: Card): PlayerState["uid"] {
  return find(state.players, ({ hand }) => hand.includes(card))!.uid;
}

export function createUID<T extends string>(prefix: T, id: string): UID<T> {
  return `${prefix}-${id}` as UID<T>;
}

export const mapFaunaType = (faunaType: string): FaunaType => {
  const faunaTypeMap: { [key: string]: FaunaType } = {
    "birds": "bird",
    "fish/elasmobranch": "fish",
    "mammals": "mammal",
    "zooplankton": "zooplankton",
    "zoobenthos": "zoobenthos"
  };

  return faunaTypeMap[faunaType] || "unknown";
};
export function getAngleSector(rawAngle: number, numSectors: number): number {
  return Math.floor((rawAngle / (2 * Math.PI)) * numSectors) % numSectors;
}

export function getSector(coord: Coordinate, precision = 5) {
  return `${~~(coord.x / precision)}_${~~(coord.y / precision)}`;
}

export function getDirectionArrow(rawAngle: number): string {
  const sector = getAngleSector(rawAngle, 8);
  return (
    {
      0: "→",
      1: "↗",
      2: "↑",
      3: "↖",
      4: "←",
      5: "↙",
      6: "↓",
      7: "↘",
    }[sector] ?? "?"
  );
}

export function calculateDurations(appearance: GamePieceAppearance, animSpeed: number) {
  const isDisappearing = !appearance.position;

  const startAnimationDelay = appearance.delay / (animSpeed * baseDuration);
  const mainDuration = appearance.duration / (animSpeed * baseDuration);
  const cardFlipDuration = mainDuration * 0.2;
  const zDuration = mainDuration + cardFlipDuration;

  if (isDisappearing) {
    // For disappearing animations first flip, then move
    const flipDelay = startAnimationDelay;
    const flipDuration = appearance.doesFlip ? mainDuration + cardFlipDuration : 0;
    const mainDelay = appearance.doesFlip ? startAnimationDelay + cardFlipDuration : startAnimationDelay;
    const zDelay = mainDelay;
    const totalDuration = Math.max(mainDelay + mainDuration, zDelay + zDuration, flipDelay + flipDuration);

    return {
      mainDuration,
      mainDelay,
      cardFlipDuration,
      zDelay,
      zDuration,
      flipDuration,
      flipDelay,
      totalDuration,
    };
  } else {
    // For appearing/moving animations first move, then flip
    const mainDelay = startAnimationDelay;
    const zDelay = mainDelay;
    const flipDuration = appearance.doesFlip ? mainDuration + cardFlipDuration : 0;
    const flipDelay = appearance.doesFlip ? mainDuration + mainDelay : 0;
    const totalDuration = Math.max(mainDelay + mainDuration, zDelay + zDuration, flipDelay + flipDuration);

    return {
      mainDuration,
      mainDelay,
      cardFlipDuration,
      zDelay,
      zDuration,
      flipDuration,
      flipDelay,
      totalDuration,
    };
  }
}
