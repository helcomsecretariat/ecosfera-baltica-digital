import { AnimalCard, GameState, PlantCard, PlayerState } from "@/state/types";
import { createUID } from "@/state/utils";

let ID_COUNTER = 0;

export function createTestUID<T extends string>(prefix: T, postfix = "") {
  return createUID(prefix, (++ID_COUNTER).toString() + "-" + postfix);
}

export const plant_ascophyllym: PlantCard = {
  name: "Ascophyllym nodosum",
  type: "plant",
  biomes: ["coast", "hard benthic"],
  abilities: ["move"],
  elements: ["sun", "oxygen", "salinity"],
  uid: createTestUID("plant", "ascophyllym"),
};

export const animal_idotea: AnimalCard = {
  name: "Idotea baltica",
  type: "animal",
  biomes: ["hard benthic"],
  abilities: ["plus"],
  uid: createTestUID("animal", "idotea"),
};

export const plant_bacteria: PlantCard = {
  name: "Bacteria",
  type: "plant",
  biomes: ["ice", "pelagic"],
  abilities: [],
  elements: ["nutrients", "temperature"],
  uid: createTestUID("plant", "bacteria"),
};

export const plant_nodularia: PlantCard = {
  name: "Nodularia spumigena",
  type: "plant",
  biomes: ["pelagic"],
  abilities: ["special"],
  elements: ["sun", "temperature"],
  uid: createTestUID("plant", "nodularia"),
};

export const animal_pusa: AnimalCard = {
  name: "Pusa hispida",
  type: "animal",
  biomes: ["ice", "pelagic", "hard benthic"],
  abilities: ["refresh"],
  uid: createTestUID("animal", "pusa"),
};

export const animal_mergus: AnimalCard = {
  name: "Mergus merganser",
  type: "animal",
  biomes: ["pelagic"],
  abilities: ["move", "plus"],
  uid: createTestUID("animal", "mergus"),
};

export const plant_aphanizomenon: PlantCard = {
  name: "Aphanizomenon flosaquae",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["ice"],
  abilities: ["special"],
  elements: ["sun", "temperature"],
};

export const plant_mesodinium: PlantCard = {
  name: "Mesodinium rubrum",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["pelagic"],
  abilities: ["refresh"],
  elements: ["sun", "temperature"],
};

export const plant_pilayella: PlantCard = {
  name: "Pilayella littoralis",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["ice", "hard benthic"],
  abilities: ["plus"],
  elements: ["sun", "nutrients", "temperature"],
};

export const plant_viruses: PlantCard = {
  name: "Viruses",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["ice", "pelagic"],
  abilities: ["refresh"],
  elements: ["salinity", "temperature"],
};

export const plant_chrysochomulina: PlantCard = {
  name: "Chrysochomulina",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["pelagic"],
  abilities: ["move"],
  elements: ["oxygen", "salinity", "nutrients"],
};

export const plant_pauliella: PlantCard = {
  name: "Pauliella taeniata",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["pelagic"],
  abilities: ["refresh"],
  elements: ["sun", "salinity"],
};

export const plant_potamogeton: PlantCard = {
  name: "Potamogeton perfoliatus",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["rivers", "soft bottom"],
  abilities: ["move"],
  elements: ["sun", "oxygen", "nutrients"],
};

export const plant_najas: PlantCard = {
  name: "Najas marina",
  type: "plant",
  uid: createTestUID("plant"),
  biomes: ["rivers", "soft bottom"],
  abilities: [],
  elements: ["sun", "oxygen", "nutrients"],
};

const player: PlayerState = {
  uid: createTestUID("player"),
  deck: [],
  hand: [],
  discard: [],
  abilities: [],
};

export const gameState: GameState = {
  seed: "test-seed",
  turn: {
    player: player.uid,
    currentAbility: undefined,
    exhaustedCards: [],
    playedCards: [createTestUID("element"), createTestUID("element")],
    borrowedElement: undefined,
    borrowedCount: 0,
    borrowedLimit: 1,
    usedAbilities: [],
    boughtAnimal: false,
    boughtPlant: false,
    boughtHabitat: false,
    uidsUsedForAbilityRefresh: [],
  },
  players: [player],
  plantMarket: { type: "plant", deck: [], table: [] },
  animalMarket: { type: "animal", deck: [], table: [] },
  elementMarket: { type: "element", deck: [], table: [] },
  disasterMarket: { type: "disaster", deck: [], table: [] },
  biomeMarket: { type: "biome", deck: [], table: [] },
  extinctMarket: { type: "extinction", deck: [], table: [] },
};
