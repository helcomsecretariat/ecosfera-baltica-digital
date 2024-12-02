import { AnimalCard, ElementCard, GameState, PlantCard, PlayerState } from "@/state/types";
import { createUID, mapFaunaType } from "@/state/utils";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";

let ID_COUNTER = 0;

export function createTestUID<T extends string>(prefix: T, postfix = "") {
  return createUID(prefix, (++ID_COUNTER).toString() + "-" + postfix);
}

function plantFromDeck(name: string): PlantCard {
  const plantData = (deckConfig as unknown as DeckConfig).plants[name];
  if (!plantData) throw new Error(`No plant named ${name} found in deck`);

  const uid = createTestUID("plant", name.toLowerCase().replace(/\s/g, "_"));
  return {
    name,
    type: "plant",
    habitats: plantData.habitats,
    abilities: plantData.abilities,
    elements: plantData.elements,
    uid,
  };
}

function animalFromDeck(name: string): AnimalCard {
  const animalData = (deckConfig as unknown as DeckConfig).animals[name];
  if (!animalData) throw new Error(`No animal named ${name} found in deck`);

  const uid = createTestUID("animal", name.toLowerCase().replace(/\s/g, "_"));
  return {
    name,
    type: "animal",
    habitats: animalData.habitats,
    abilities: animalData.abilities,
    uid,
    faunaType: mapFaunaType(animalData.fauna_type),
  };
}

function elementFromDeck(elementType: string): ElementCard {
  const uid = createTestUID("element", elementType);
  return {
    uid,
    type: "element",
    name: elementType,
  };
}

export const plant_ascophyllym = plantFromDeck("Ascophyllym nodosum");
export const plant_nodularia = plantFromDeck("Nodularia spumigena");
export const plant_bacteria = plantFromDeck("Bacteria");

export const animal_idotea = animalFromDeck("Idotea baltica");
export const animal_mergus = animalFromDeck("Mergus merganser");
export const animal_pusa = animalFromDeck("Pusa hispida");

export const sun_1 = elementFromDeck("sun");
export const sun_2 = elementFromDeck("sun");
export const oxygen_1 = elementFromDeck("oxygen");
export const oxygen_2 = elementFromDeck("oxygen");
export const temperature_1 = elementFromDeck("temperature");
export const temperature_2 = elementFromDeck("temperature");
export const temperature_3 = elementFromDeck("temperature");
export const nutrients_1 = elementFromDeck("nutrients");
export const salinity_1 = elementFromDeck("salinity");
export const salinity_2 = elementFromDeck("salinity");

const player: PlayerState = {
  uid: createTestUID("player"),
  name: "",
  deck: [],
  hand: [],
  discard: [],
  abilities: [],
};

export const gameState: GameState = {
  deck: deckConfig as unknown as DeckConfig,
  turn: {
    player: player.uid,
    currentAbility: undefined,
    exhaustedCards: [],
    playedCards: [createTestUID("element"), createTestUID("element")],
    borrowedElement: undefined,
    usedAbilities: [],
    boughtAnimal: false,
    boughtPlant: false,
    unlockedHabitat: false,
    uidsUsedForAbilityRefresh: [],
    refreshedAbilityUids: [],
    phase: "action",
  },
  players: [player],
  plantMarket: { type: "plant", deck: [], table: [] },
  animalMarket: { type: "animal", deck: [], table: [] },
  elementMarket: { type: "element", deck: [], table: [] },
  disasterMarket: { type: "disaster", deck: [], table: [] },
  habitatMarket: { type: "habitat", deck: [], table: [] },
  extinctMarket: { type: "extinction", deck: [], table: [] },
  policyMarket: { type: "policy", deck: [], table: [], acquired: [], active: [], funding: [] },
  config: {
    seed: "test-seed",
    playerCount: 1,
    difficulty: 3,
    useSpecialCards: false,
    playersPosition: "around",
    playerNames: [""],
  },
  statistics: {
    animalsBought: 0,
    plantsBought: 0,
  },
};
