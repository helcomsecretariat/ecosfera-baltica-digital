import { DeckConfig } from "@/decks/schema";
import { Card } from "@/state/types";
import { clsx, type ClassValue } from "clsx";
import { t } from "i18next";
import { ListIterateeCustom } from "lodash";
import { findIndex } from "lodash-es";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
    result += randomChar;
  }
  return result;
}

export function generateRandomName(existingNames: Set<string>): string {
  const adjectives = Object.values(t("playerNames.adjectives", { returnObjects: true }));
  const animalsAndPlants = Object.values(t("playerNames.plantsAndAnimals", { returnObjects: true }));
  const nouns = Object.values(t("playerNames.nouns", { returnObjects: true }));

  let name: string;

  do {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimalOrPlant = animalsAndPlants[Math.floor(Math.random() * animalsAndPlants.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomName = Math.random() > 0.5 ? randomAnimalOrPlant : randomNoun;

    // Use a regex to split the emoji from the rest of the name
    const match = randomName.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*(.*)$/u);
    const emoji = match ? match[1] : ""; // Extract the emoji
    const namePart = match ? match[2] : randomName; // Extract the name part

    // Combine the emoji with the adjective and the name part
    name = `${emoji}${randomAdjective} ${namePart}`;
  } while (existingNames.has(name));

  existingNames.add(name);
  return name;
}

export function getCardComparator(ordering: DeckConfig["ordering"]): (a: Card, b: Card) => number {
  const orderMap: { [key: string]: number } = {};
  const elementSubOrderMap: { [key: string]: number } = {};

  ordering.forEach((category, index) => {
    const type = category[0] as string;
    const subTypes = category[1];
    orderMap[type] = index;

    if (subTypes) {
      subTypes.forEach((subType, subIndex) => {
        elementSubOrderMap[subType] = subIndex;
      });
    }
  });

  return (a: Card, b: Card): number => {
    if (orderMap[a.type] !== orderMap[b.type]) {
      return orderMap[a.type] - orderMap[b.type];
    }

    if (a.type === "element" && b.type === "element") {
      return elementSubOrderMap[a.name] - elementSubOrderMap[b.name];
    }

    return a.uid.localeCompare(b.uid);
  };
}

export function removeOne<T>(array: T[], predicate: ListIterateeCustom<T, boolean>): T | undefined {
  const index = findIndex(array, predicate);
  if (index > -1) {
    return array.splice(index, 1)[0];
  }
  return undefined;
}

export const capitalize = <T extends string>(str: T): Capitalize<T> => {
  if (!str) return str as Capitalize<T>;
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
};
