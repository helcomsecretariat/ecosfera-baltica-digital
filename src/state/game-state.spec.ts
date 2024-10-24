import { describe, expect, it } from "vitest";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { spawnDeck } from "./deck-spawner";
import { DeckConfig } from "@/decks/schema";
import type { GameConfig } from "@/state/types";

const gameConfig: GameConfig = {
  seed: "test-seed",
  playerCount: 1,
  difficulty: 3,
  useSpecialCards: false,
  playersPosition: "around",
  playerNames: [""],
};

describe("game state", () => {
  it("smoke", () => {
    expect(spawnDeck(deckConfig as DeckConfig, gameConfig)).toBeTruthy();
  });

  it("all players' cards have unique uids", () => {
    const gameState = spawnDeck(deckConfig as DeckConfig, gameConfig);

    const allCards = gameState.players.flatMap((player) => [...player.deck, ...player.hand, ...player.discard]);

    const allUIDs = allCards.map((card) => card.uid);
    const uniqueUIDs = new Set(allUIDs);

    expect(uniqueUIDs.size).toBe(allUIDs.length);
  });

  it("difficulty level affects the number of cards in the decks", () => {
    // Spawn the game state with 1 player
    const gameStateOnePlayer = spawnDeck(deckConfig as DeckConfig, gameConfig);
    const onePlayerElementsDeckSize = gameStateOnePlayer.elementMarket.deck.length;
    const onePlayerDisastersDeckSize = gameStateOnePlayer.disasterMarket.deck.length;

    // Spawn the game state with 2 players
    const gameStateTwoPlayers = spawnDeck(deckConfig as DeckConfig, { ...gameConfig, playerCount: 2 });
    const twoPlayerElementsDeckSize = gameStateTwoPlayers.elementMarket.deck.length;
    const twoPlayerDisastersDeckSize = gameStateTwoPlayers.disasterMarket.deck.length;

    // Spawn the game state with 2 player and higher difficulty
    const gameStateHighDiff = spawnDeck(deckConfig as DeckConfig, { ...gameConfig, playerCount: 2, difficulty: 4 });
    const gameStateHighDiffElementsDeckSize = gameStateHighDiff.elementMarket.deck.length;
    const gameStateHighDiffDisastersDeckSize = gameStateHighDiff.disasterMarket.deck.length;

    expect(twoPlayerElementsDeckSize).toEqual(onePlayerElementsDeckSize);
    expect(twoPlayerDisastersDeckSize).toBeLessThan(onePlayerDisastersDeckSize);

    expect(gameStateHighDiffElementsDeckSize).toBeLessThan(twoPlayerElementsDeckSize);
    expect(gameStateHighDiffDisastersDeckSize).toEqual(twoPlayerDisastersDeckSize);
  });

  it("deck remains the same with the same seed", () => {
    // Spawn the game state with 3 players twice with the same seed
    const firstGameState = spawnDeck(deckConfig as DeckConfig, { ...gameConfig, playerCount: 3 });
    const secondGameState = spawnDeck(deckConfig as DeckConfig, { ...gameConfig, playerCount: 3 });

    // Compare the JSON string representation of both game states
    const firstGameStateJSON = JSON.stringify(firstGameState);
    const secondGameStateJSON = JSON.stringify(secondGameState);

    expect(firstGameStateJSON).toBe(secondGameStateJSON);
  });
});
