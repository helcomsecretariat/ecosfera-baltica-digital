import { clsx, type ClassValue } from "clsx";
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
  const adjectives = [
    "Swift",
    "Brave",
    "Fierce",
    "Mighty",
    "Clever",
    "Bold",
    "Calm",
    "Quick",
    "Shy",
    "Noble",
    "Sly",
    "Wise",
    "Wild",
    "Bright",
    "Gentle",
    "Sharp",
    "Quiet",
    "Soft",
    "Cool",
    "Daring",
    "Silent",
    "Cold",
    "Deep",
    "Blue",
    "Free",
    "Pale",
    "Dark",
    "Gold",
  ];

  const animalsAndPlants = [
    "🦊Fox",
    "🦅Hawk",
    "🐺Wolf",
    "🐻Bear",
    "🐱Lynx",
    "🦉Owl",
    "🦌Elk",
    "🦭Seal",
    "🐸Frog",
    "🐦Crow",
    "🦇Bat",
    "🦡Mole",
    "🦎Newt",
    "🐟Perch",
    "🐟Cod",
    "🐰Hare",
    "🦢Swan",
    "🦐Shrimp",
    "🦪Mussel",
    "🐟Trout",
    "🐦Heron",
    "🦀Crab",
    "🐦Lark",
    "🌿Fern",
    "🌱Moss",
    "🌲Birch",
    "🌾Reed",
    "🐠Sprat",
    "🐟Salmon",
    "🐭Vole",
    "🌲Pine",
    "🐟Bream",
    "🦀Limpet",
    "🦦Otter",
    "🪸Kelp",
    "🌿Algae",
    "🐟Dace",
  ];

  const nouns = [
    "🌊Wave",
    "🌊Tide",
    "🌪 Storm",
    "🐚Shell",
    "🪨Rock",
    "🏖 Sand",
    "🪨Stone",
    "🌫 Fog",
    "🌊Drift",
    "🪸Reef",
    "🌊Cove",
    "🪺Nest",
    "🍃Leaf",
    "🌸Bloom",
    "🌱Root",
    "🌿Weed",
    "🌿Spire",
    "🌲Bark",
    "🌿Twig",
    "🌊Fjord",
    "❄️Sleet",
    "❄️Frost",
    "✨Glow",
    "💨Wind",
    "🌊Bay",
    "❄️Ice",
    "🧂Salt",
  ];

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
    name = `${emoji} ${randomAdjective} ${namePart}`;
  } while (existingNames.has(name));

  existingNames.add(name);
  return name;
}
