import type { Card } from "@/state/types";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";

const pastelColors = {
  plantsAndAnimals: "#e1e1e1",
  elements: {
    sun: "#F8AE58",
    temperature: "#0290BD",
    nutrients: "#66A468",
    salinity: "#D85365",
    oxygen: "#934786",
  },
};

export function getElementColor(name: string): string {
  if (name.includes("salinity")) {
    return pastelColors.elements.salinity;
  } else if (name.includes("sun")) {
    return pastelColors.elements.sun;
  } else if (name.includes("nutrients")) {
    return pastelColors.elements.nutrients;
  } else if (name.includes("temperature")) {
    return pastelColors.elements.temperature;
  } else if (name.includes("oxygen")) {
    return pastelColors.elements.oxygen;
  }
  return pastelColors.plantsAndAnimals;
}

export function getCardBGColor(card: Card): string {
  switch (card.type) {
    case "plant":
    case "animal":
      return pastelColors.plantsAndAnimals;

    case "element":
      return getElementColor(card.name);

    default:
      return pastelColors.plantsAndAnimals;
  }
}

export function getAssetPath(type: string, name: string, prefix = deckConfig.assets_prefix): string {
  const cardPrefix = type === "animal" || type === "plant" ? "entity" : type;
  const assetPrefix = `/${prefix}/`;
  return `${assetPrefix}${cardPrefix}_${name}.avif`.replace(/\s+/g, "_").toLowerCase();
}

export function getHighlightTextureAssetPath(): string {
  return `/${deckConfig.assets_prefix}/blur.webp`;
}
