import { describe, expect, it } from "vitest";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { spawnDeck } from "./deck-spawner";
import { DeckConfig } from "@/decks/schema";

describe("game state", () => {
  it("smoke", () => {
    //@ts-expect-error TS can infer enums from JSON files. Deck validation is done in the schema
    expect(spawnDeck(deckConfig, 1, "42")).toBeTruthy();
  });

  it("all players' cards have unique uids", () => {
    const seed = "test-seed";
    const gameState = spawnDeck(deckConfig as DeckConfig, 3, seed);

    const allCards = gameState.players.flatMap((player) => [...player.deck, ...player.hand, ...player.discard]);

    const allUIDs = allCards.map((card) => card.uid);
    const uniqueUIDs = new Set(allUIDs);

    expect(uniqueUIDs.size).toBe(allUIDs.length);
  });

  it("elements and disasters decks have fewer cards when spawning more players", () => {
    const seed = "test-seed";

    // Spawn the game state with 1 player
    const gameStateOnePlayer = spawnDeck(deckConfig as DeckConfig, 1, seed);
    const onePlayerElementsDeckSize = gameStateOnePlayer.elementMarket.deck.length;
    const onePlayerDisastersDeckSize = gameStateOnePlayer.disasterMarket.deck.length;

    // Spawn the game state with 2 players
    const gameStateTwoPlayers = spawnDeck(deckConfig as DeckConfig, 2, seed);
    const twoPlayerElementsDeckSize = gameStateTwoPlayers.elementMarket.deck.length;
    const twoPlayerDisastersDeckSize = gameStateTwoPlayers.disasterMarket.deck.length;

    // Check that the number of cards in the decks has decreased
    expect(twoPlayerElementsDeckSize).toBeLessThan(onePlayerElementsDeckSize);
    expect(twoPlayerDisastersDeckSize).toBeLessThan(onePlayerDisastersDeckSize);
  });

  it("deck remains the same with the same seed", () => {
    const seed = "consistent-seed";

    // Spawn the game state with 3 players twice with the same seed
    const firstGameState = spawnDeck(deckConfig as DeckConfig, 3, seed);
    const secondGameState = spawnDeck(deckConfig as DeckConfig, 3, seed);

    // Compare the JSON string representation of both game states
    const firstGameStateJSON = JSON.stringify(firstGameState);
    const secondGameStateJSON = JSON.stringify(secondGameState);

    expect(firstGameStateJSON).toBe(secondGameStateJSON);
  });
});
