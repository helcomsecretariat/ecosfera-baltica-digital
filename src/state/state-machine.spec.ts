import { Actor, createActor } from "xstate";
import { test, expect, beforeEach } from "vitest";
import stateMachine from "@/state/state-machine"; // Assuming this is the default export
import { GameState, PlantCard, AbilityTile } from "@/state/types";
import config from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";
import GameStateMachine from "@/state/state-machine";

const plant19: PlantCard = {
  name: "Aphanizomenon flosaquae",
  type: "plant",
  uid: "19",
  biomes: ["ice"],
  abilities: ["special"],
  elements: ["sun", "temperature"],
};
const plant17: PlantCard = {
  name: "Mesodinium rubrum",
  type: "plant",
  uid: "17",
  biomes: ["pelagic"],
  abilities: ["refresh"],
  elements: ["sun", "temperature"],
};
const plant11: PlantCard = {
  name: "Pilayella littoralis",
  type: "plant",
  uid: "11",
  biomes: ["ice", "hard benthic"],
  abilities: ["plus"],
  elements: ["sun", "nutrients", "temperature"],
};

const plant29: PlantCard = {
  name: "Viruses",
  type: "plant",
  uid: "29",
  biomes: ["ice", "pelagic"],
  abilities: ["refresh"],
  elements: ["salinity", "temperature"],
};

const plant2: PlantCard = {
  name: "Chrysochomulina",
  type: "plant",
  uid: "2",
  biomes: ["pelagic"],
  abilities: ["move"],
  elements: ["oxygen", "salinity", "nutrients"],
};

const plant14: PlantCard = {
  name: "Pauliella taeniata",
  type: "plant",
  uid: "14",
  biomes: ["pelagic"],
  abilities: ["refresh"],
  elements: ["sun", "salinity"],
};

const plant1: PlantCard = {
  name: "Potamogeton perfoliatus",
  type: "plant",
  uid: "1",
  biomes: ["rivers", "soft bottom"],
  abilities: ["move"],
  elements: ["sun", "oxygen", "nutrients"],
};

const plant6: PlantCard = {
  name: "Najas marina",
  type: "plant",
  uid: "6",
  biomes: ["rivers", "soft bottom"],
  abilities: [],
  elements: ["sun", "oxygen", "nutrients"],
};

const initialContext: GameState = {
  activePlayerUid: "pl0",
  players: [
    {
      uid: "pl0",
      deck: [], // empty deck
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

let actor: Actor<typeof GameStateMachine>;

beforeEach(() => {
  actor = createActor(stateMachine, {
    input: { config: config as DeckConfig, numberOfPlayers: 2, seed: "42" },
  });

  actor.start();
  actor.send({
    type: "IDDQD",
    data: initialContext,
  });
});

test("drawing a card when player's deck is empty", async () => {
  actor.send({ type: "DRAW_PLAYER_CARD", data: {} });
  expect(actor.getSnapshot().context.players[0].hand.length).toBe(0);
});

test("refreshing market does not shuffle or create new cards", async () => {
  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      plantMarket: {
        type: "plant",
        deck: [plant19, plant17, plant11, plant29],
        table: [plant2, plant14, plant1, plant6],
      },
    },
  });

  const initialMarketState = actor.getSnapshot().context.plantMarket;

  actor.send({ type: "REFRESH_MARKET_DECK", data: { market_type: "plant" } });

  const newMarketState = actor.getSnapshot().context.plantMarket;

  expect(newMarketState.deck.map(({ uid }) => uid)).toEqual(["2", "14", "1", "6"]);
  expect(newMarketState.deck.length).toBe(initialMarketState.deck.length);
});

test("after buying a card, it appears in player's hand and new card appears in table market", async () => {
  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      players: [
        {
          uid: "pl0",
          deck: [],
          hand: [],
          discard: [],
          abilities: [],
        },
      ],
      plantMarket: {
        type: "plant",
        deck: [plant19, plant17, plant11, plant29],
        table: [plant2, plant14, plant1, plant6],
      },
    },
  });

  actor.send({ type: "BUY_MARKET_CARD", data: { card: plant2 } });

  // 3. Assert
  const updatedContext = actor.getSnapshot().context;
  const updatedPlayer = updatedContext.players[0];

  expect(updatedPlayer?.hand).toContainEqual(plant2);
  expect(updatedContext.plantMarket.table).not.toContainEqual(plant2);
  expect(updatedContext.plantMarket.deck).not.toContainEqual(plant2);
});

test("using a token marks it as used", async () => {
  const token = { name: "move", is_used: false, uid: "t1" } as AbilityTile;

  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      players: [
        {
          ...initialContext.players[0],
          abilities: [token],
        },
      ],
    },
  });

  actor.send({ type: "USE_TOKEN", data: { token } });

  const updatedContext = actor.getSnapshot().context;

  expect(updatedContext.players[0].abilities[0].is_used).toBe(true);
});

test("refreshing a token marks it as unused", async () => {
  const token = { name: "Special Token", is_used: true } as AbilityTile;

  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      players: [
        {
          ...initialContext.players[0],
          abilities: [token],
        },
      ],
    },
  });

  actor.send({ type: "REFRESH_TOKEN", data: { token } });

  const updatedContext = actor.getSnapshot().context;

  expect(updatedContext.players[0].abilities[0].is_used).toBe(false);
});

test("drawing from the market reduces the deck and adds to the table", async () => {
  const marketType = "plant";

  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      plantMarket: {
        ...initialContext.plantMarket,
        deck: [plant19, plant17, plant11],
        table: [],
      },
    },
  });

  const initialMarket = actor.getSnapshot().context.plantMarket;
  expect(initialMarket.deck.length).toBe(3);
  expect(initialMarket.table.length).toBe(0);

  actor.send({ type: "DRAW_MARKET_CARD", data: { market_type: marketType } });

  const updatedMarket = actor.getSnapshot().context.plantMarket;
  expect(updatedMarket.deck.length).toBe(2);
  expect(updatedMarket.table.length).toBe(1);
});

test("player draws a card from their deck", async () => {
  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      players: [
        {
          ...initialContext.players[0],
          deck: [plant1],
        },
      ],
    },
  });

  actor.send({ type: "DRAW_PLAYER_CARD", data: {} });

  const updatedContext = actor.getSnapshot().context;
  expect(updatedContext.players[0].deck.length).toBe(0);
  expect(updatedContext.players[0].hand.length).toBe(1);
  expect(updatedContext.players[0].hand[0]).toEqual(plant1);
});

test("drawing from an empty player deck", async () => {
  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      players: [
        {
          ...initialContext.players[0],
          deck: [],
          hand: [],
        },
      ],
    },
  });

  actor.send({ type: "DRAW_PLAYER_CARD", data: {} });

  const updatedContext = actor.getSnapshot().context;
  expect(updatedContext.players[0].deck.length).toBe(0);
  expect(updatedContext.players[0].hand.length).toBe(0);
});

test("drawing from an empty market deck", async () => {
  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      plantMarket: {
        ...initialContext.plantMarket,
        deck: [],
        table: [],
      },
    },
  });

  actor.send({ type: "DRAW_MARKET_CARD", data: { market_type: "plant" } });

  const updatedMarket = actor.getSnapshot().context.plantMarket;
  expect(updatedMarket.deck.length).toBe(0);
  expect(updatedMarket.table.length).toBe(0);
});

test("refreshing an empty market", async () => {
  actor.send({
    type: "IDDQD",
    data: {
      ...initialContext,
      plantMarket: {
        ...initialContext.plantMarket,
        deck: [],
        table: [],
      },
    },
  });

  actor.send({ type: "REFRESH_MARKET_DECK", data: { market_type: "plant" } });

  const updatedMarket = actor.getSnapshot().context.plantMarket;
  expect(updatedMarket.deck.length).toBe(0);
  expect(updatedMarket.table.length).toBe(0);
});
