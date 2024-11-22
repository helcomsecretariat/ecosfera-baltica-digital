import { cardHeight, cardWidth, policyCardWidth } from "./card";
import { GamePieceTransform, HabitatName } from "@/state/types";

// Game board
export const upperXBoundary = 100;
export const lowerXBoundary = upperXBoundary * -1;
export const upperYBoundary = 60;
export const lowerYBoundary = upperYBoundary * -1;
export const cameraZoom = upperXBoundary * 1.4;

// Market and player cards
export const cardXOffset = cardWidth + 1;
export const policyCardXOffset = policyCardWidth + 1;
export const overlappingCardXOffset = cardXOffset / 3;
export const cardYOffset = cardHeight + 1;
export const marketYStart = cardYOffset;
export const marketXStart = -2 * cardXOffset;
export const playerCardsYStart = lowerYBoundary + cardHeight / 2;
export const abilityOffset = 7;

// Habitat and extinction tiles
export const tileSize = cardWidth / 2.1;
export const hexagonTileXStart = marketXStart - cardXOffset * 1.8;
export const extinctionTileYStart = marketYStart + tileSize;
export const habitatTileYStart = marketYStart - cardHeight * 1.4;
export const hexagonTileXOffset = 10;
export const hexagonTileYOffset = 11;

export const tileGridTransforms = (baseX: number, baseY: number): GamePieceTransform[] => {
  const spacingMultiplier = 1.4;
  const rotation = { x: -Math.PI / 2, y: Math.PI / 2, z: 0 };
  return [
    { position: { x: baseX, y: baseY, z: 0 }, rotation },
    {
      position: { x: baseX - tileSize * spacingMultiplier, y: baseY - tileSize * 0.6 * spacingMultiplier, z: 0 },
      rotation,
    },
    {
      position: { x: baseX + tileSize * spacingMultiplier, y: baseY - tileSize * 0.6 * spacingMultiplier, z: 0 },
      rotation,
    },
    {
      position: { x: baseX - tileSize * spacingMultiplier, y: baseY - tileSize * 1.76 * spacingMultiplier, z: 0 },
      rotation,
    },
    {
      position: { x: baseX, y: baseY - tileSize * 2.35 * spacingMultiplier, z: 0 },
      rotation,
    },
    {
      position: { x: baseX + tileSize * spacingMultiplier, y: baseY - tileSize * 1.76 * spacingMultiplier, z: 0 },
      rotation,
    },
    { position: { x: baseX, y: baseY - tileSize * 1.65, z: 0 }, rotation },
  ];
};

export const habitatTransforms = (baseX: number, baseY: number): { [K in HabitatName]: GamePieceTransform } => {
  const transforms = tileGridTransforms(baseX, baseY);
  return {
    pelagic: transforms[0],
    rock: transforms[1],
    ice: transforms[2],
    mud: transforms[3],
    rivers: transforms[4],
    coast: transforms[5],
    baltic: transforms[6],
  };
};

// Rotation override
export const rotationOverrideThreshold = 0.7;
