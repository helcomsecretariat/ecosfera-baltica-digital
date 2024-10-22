import { Actor, createActor } from "xstate";
import { test, beforeEach } from "vitest";
import { GameState, PlayerUID } from "@/state/types";
import config from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";
import { TurnMachine } from "@/state/machines/turn";

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
    input: {
      deckConfig: config as DeckConfig,
      gameConfig: { playerCount: 2, seed: "42", difficulty: 3, playersPosition: "around", useSpecialCards: false },
    },
  });

  actor.start();
  actor.send({ type: "iddqd", context: initialContext as GameState });
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

test.skip("can change element before borrowing", async () => {
  // Implement this test
});

test.skip("can't borrow twice", async () => {
  // Implement this test
});
