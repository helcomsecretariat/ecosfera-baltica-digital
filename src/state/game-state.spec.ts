import deckConfig from "~/decks/ecosfera-baltica.deck.json";
import { spawnDeck } from "./game-state";

describe("game state", () => {
  it("smoke", () => {
    //@ts-expect-error TS can infer enums from JSON files. Deck validation is done in the schema
    expect(spawnDeck(deckConfig)).toBeTruthy();
  });
});
