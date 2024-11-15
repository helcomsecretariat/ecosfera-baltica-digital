import { GamePieceAppearance } from "@/state/types";

export const baseDuration = 0.01; // time it takes to move a single card over distance equals to card width
export const deckAnimationTimings = {
  delay: 0,
  duration: baseDuration,
};

export const voidSpaceAppearance: GamePieceAppearance = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  initialPosition: { x: 0, y: 0, z: 0 },
  initialRotation: { x: 0, y: 0, z: 0 },
  exitPosition: { x: 0, y: 0, z: 0 },
  exitRotation: { x: 0, y: 0, z: 0 },
  duration: 0,
  delay: 0,
  doesFlip: false,
};
