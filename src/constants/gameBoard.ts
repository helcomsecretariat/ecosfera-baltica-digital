import { cardHeight, cardWidth } from "./card";

// Game board
export const upperXBoundary = 100;
export const lowerXBoundary = upperXBoundary * -1;
export const upperYBoundary = 60;
export const lowerYBoundary = upperYBoundary * -1;
export const cameraZoom = upperXBoundary * 1.4;

// Market and player cards
export const cardXOffset = cardWidth + 3;
export const cardYOffset = cardHeight + 3;
export const marketYStart = 2 * cardYOffset;
export const marketXStart = -2 * cardXOffset;
export const playerCardsYStart = -2 * cardYOffset;
export const abilityOffset = 10;

// Biome and extinction tiles
export const hexagonTileXStart = lowerXBoundary * 0.9;
export const extinctionTileYStart = upperYBoundary * 0.9;
export const biomeTileYStart = extinctionTileYStart - 25;
export const hexagonTileXOffset = 10;
export const hexagonTileYOffset = 11;
