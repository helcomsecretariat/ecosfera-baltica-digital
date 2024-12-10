import type { Card, GamePiece } from "@/state/types";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";

const pastelColors = {
  plantsAndAnimals: "#e1e1e1",
  elements: {
    sun: "#F8AE58",
    temperature: "#D85365",
    nutrients: "#66A468",
    salinity: "#934786",
    oxygen: "#0290BD",
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

export function getAssetPath(
  type: GamePiece["type"] | "stage" | "tile",
  name: GamePiece["name"],
  prefix = deckConfig.assets_prefix,
): string {
  const fileNames: Record<typeof type, string> = {
    animal: `entity_${name}`,
    plant: `entity_${name}`,
    element: `element_${name}`,
    disaster: `disaster_${name}`,
    policy: `litter`,
    ability: `ability_${name}`,
    stage: `stage_${name}`,
    habitat: `tile_${name}`,
    extinction: `tile_extinction`,
    tile: `tile_${name}`,
  } as const;

  const fileName = fileNames[type];
  const assetPrefix = `/${prefix}/`;
  return `${assetPrefix}${fileName}.avif`.replace(/\s+/g, "_").toLowerCase();
}

export function getHighlightTextureAssetPath(circular: boolean | undefined = undefined): string {
  return `/${deckConfig.assets_prefix}/${circular ? "circular_blur" : "blur"}.avif`;
}
