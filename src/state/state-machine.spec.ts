import { Actor, createActor } from "xstate";
import { test, beforeEach } from "vitest";
import { GameState, PlayerUID } from "@/state/types";
import config from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";
import { TurnMachine } from "@/state/machines/turn";

// const plant19: PlantCard = {
//   name: "Aphanizomenon flosaquae",
//   type: "plant",
//   uid: "plant-19" as PlantUID,
//   biomes: ["ice"],
//   abilities: ["special"],
//   elements: ["sun", "temperature"],
// };

// const plant17: PlantCard = {
//   name: "Mesodinium rubrum",
//   type: "plant",
//   uid: "plant-17" as PlantUID,
//   biomes: ["pelagic"],
//   abilities: ["refresh"],
//   elements: ["sun", "temperature"],
// };

// const plant11: PlantCard = {
//   name: "Pilayella littoralis",
//   type: "plant",
//   uid: "plant-11" as PlantUID,
//   biomes: ["ice", "hard benthic"],
//   abilities: ["plus"],
//   elements: ["sun", "nutrients", "temperature"],
// };

// const plant29: PlantCard = {
//   name: "Viruses",
//   type: "plant",
//   uid: "plant-29" as PlantUID,
//   biomes: ["ice", "pelagic"],
//   abilities: ["refresh"],
//   elements: ["salinity", "temperature"],
// };

// const plant2: PlantCard = {
//   name: "Chrysochomulina",
//   type: "plant",
//   uid: "plant-2" as PlantUID,
//   biomes: ["pelagic"],
//   abilities: ["move"],
//   elements: ["oxygen", "salinity", "nutrients"],
// };

// const plant14: PlantCard = {
//   name: "Pauliella taeniata",
//   type: "plant",
//   uid: "plant-14" as PlantUID,
//   biomes: ["pelagic"],
//   abilities: ["refresh"],
//   elements: ["sun", "salinity"],
// };

// const plant1: PlantCard = {
//   name: "Potamogeton perfoliatus",
//   type: "plant",
//   uid: "plant-1" as PlantUID,
//   biomes: ["rivers", "soft bottom"],
//   abilities: ["move"],
//   elements: ["sun", "oxygen", "nutrients"],
// };

// const plant6: PlantCard = {
//   name: "Najas marina",
//   type: "plant",
//   uid: "plant-6" as PlantUID,
//   biomes: ["rivers", "soft bottom"],
//   abilities: [],
//   elements: ["sun", "oxygen", "nutrients"],
// };

const initialContext: Partial<GameState> = {
  players: [
    {
      uid: "player-0" as PlayerUID,
      deck: [],
      hand: [],
      discard: [],
      abilities: [],
    },
  ],
  plantMarket: {
    type: "plant",
    deck: [], // deck should be filled with plant cards in real context
    table: [],
  },
  animalMarket: {
    type: "animal",
    deck: [], // deck should be filled with animal cards in real context
    table: [],
  },
  elementMarket: {
    type: "element",
    deck: [], // deck should be filled with element cards in real context
    table: [],
  },
  disasterMarket: {
    type: "disaster",
    deck: [], // deck should be filled with disaster cards in real context
    table: [],
  },
  biomeMarket: {
    type: "biome",
    deck: [], // deck should be filled with biome tiles in real context
    table: [],
  },
  extinctMarket: {
    type: "extinction",
    deck: [], // deck should be filled with extinction tiles in real context
    table: [],
  },
};

let actor: Actor<typeof TurnMachine>;

beforeEach(() => {
  actor = createActor(TurnMachine, {
    input: { config: config as DeckConfig, numberOfPlayers: 2, seed: "42" },
  });

  actor.start();
  actor.send({
    type: "buy.iddqd",
    context: initialContext as GameState,
  });
});

test.skip("drawing a card when player's deck is empty", async () => {
  // Implement this test
});

test.skip("refreshing market does not shuffle or create new cards", async () => {
  // Implement this test
});

test.skip("after buying a card, it appears in player's hand and new card appears in table market", async () => {
  // Implement this test
});

test.skip("using a token marks it as used", async () => {
  // Implement this test
});

test.skip("refreshing a token marks it as unused", async () => {
  // Implement this test
});

test.skip("drawing from the market reduces the deck and adds to the table", async () => {
  // Implement this test
});

test.skip("player draws a card from their deck", async () => {
  // Implement this test
});

test.skip("drawing from an empty player deck", async () => {
  // Implement this test
});

test.skip("drawing from an empty market deck", async () => {
  // Implement this test
});

test.skip("refreshing an empty market", async () => {
  // Implement this test
});
