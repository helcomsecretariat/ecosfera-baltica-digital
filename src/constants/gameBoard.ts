import { cardHeight, cardWidth } from "./card";

// Game board
export const upperXBoundary = 100;
export const lowerXBoundary = upperXBoundary * -1;
export const upperYBoundary = 60;
export const lowerYBoundary = upperYBoundary * -1;
export const cameraZoom = upperXBoundary * 1.4;

// Market and player cards
export const cardXOffset = cardWidth + 1;
export const cardYOffset = cardHeight + 1;
export const marketYStart = cardYOffset;
export const marketXStart = -2 * cardXOffset;
export const playerCardsYStart = lowerYBoundary + cardHeight / 2;
export const abilityOffset = 7;

// Biome and extinction tiles
export const tileSize = cardWidth / 3.5;
export const hexagonTileXStart = marketXStart - cardXOffset;
export const extinctionTileYStart = marketYStart + tileSize;
export const biomeTileYStart = marketYStart - cardYOffset + tileSize;
export const hexagonTileXOffset = 10;
export const hexagonTileYOffset = 11;
