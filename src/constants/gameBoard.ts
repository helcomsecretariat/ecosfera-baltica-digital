import { Coordinate } from "@/state/types";
import { cardHeight, cardWidth } from "./card";

// Game board
export const upperXBoundary = 100;
export const lowerXBoundary = upperXBoundary * -1;
export const upperYBoundary = 60;
export const lowerYBoundary = upperYBoundary * -1;
export const cameraZoom = upperXBoundary * 1.4;

// Market and player cards
export const cardXOffset = cardWidth + 1;
export const overlappingCardXOffset = cardXOffset / 3;
export const cardYOffset = cardHeight + 1;
export const marketYStart = cardYOffset;
export const marketXStart = -2 * cardXOffset;
export const playerCardsYStart = lowerYBoundary + cardHeight / 2;
export const abilityOffset = 7;

// Habitat and extinction tiles
export const tileSize = cardWidth / 3.5;
export const hexagonTileXStart = marketXStart - cardXOffset * 1.2;
export const extinctionTileYStart = marketYStart + tileSize;
export const habitatTileYStart = marketYStart - cardYOffset + tileSize;
export const hexagonTileXOffset = 10;
export const hexagonTileYOffset = 11;

export const tileGridCoordinates = (baseX: number, baseY: number): Coordinate[] => {
  return [
    { x: baseX, y: baseY, z: 0 },
    { x: baseX - tileSize, y: baseY - tileSize * 0.55, z: 0 },
    { x: baseX + tileSize, y: baseY - tileSize * 0.55, z: 0 },
    { x: baseX - tileSize, y: baseY - tileSize * 1.68, z: 0 },
    { x: baseX, y: baseY - tileSize * 2.25, z: 0 },
    { x: baseX + tileSize, y: baseY - tileSize * 1.68, z: 0 },
  ];
};

// Rotation override
export const rotationOverrideThreshold = 0.7;
