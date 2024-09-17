import { cardHeight, cardWidth } from "./card";

export const upperXBoundary = 100;
export const lowerXBoundary = upperXBoundary * -1;
export const upperYBoundary = 60;
export const lowerYBoundary = upperYBoundary * -1;

export const cameraZoom = upperXBoundary * 1.4;

export const cardXOffset = cardWidth + 3;
export const cardYOffset = cardHeight + 3;
export const marketYStart = 2 * cardYOffset;
export const marketXStart = -2 * cardXOffset;
