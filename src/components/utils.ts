import type { Card } from "@/state/types";

const pastelColors = {
  plantsAndAnimals: "#e1e1e1",
  elements: {
    salinity: "#add8e6",
    sun: "#ffffb3",
    nutrients: "#b3ffb3",
    temperature: "#ff9999",
    oxygen: "#dda0dd",
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
