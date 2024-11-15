import { test, expect } from "vitest";
import { compareCards, getTestActor } from "@/state/__tests__/utils";

test("refreshing market won't create new cards", async () => {
  const { send, getState } = getTestActor();

  const stateBefore = getState();
  const token = stateBefore.players[0].abilities.find(({ name }) => name === "refresh")!;
  const deckBefore = stateBefore.plantMarket.deck;
  const tableBefore = stateBefore.plantMarket.table;
  const allCardsBefore = [...deckBefore, ...tableBefore].sort(compareCards);

  send({ type: "user.click.token", token });
  send({ type: "user.click.market.deck.plant" });

  const stateAfter = getState();
  const deckAfter = stateAfter.plantMarket.deck;
  const tableAfter = stateAfter.plantMarket.table;
  const allCardsAfter = [...deckAfter, ...tableAfter].sort(compareCards);

  expect(deckAfter[0].uid).not.toBe(deckBefore[0].uid);
  expect(deckBefore.length).toBe(deckAfter.length);
  expect(tableBefore.length).toBe(tableAfter.length);
  expect(allCardsBefore.length).toBe(allCardsAfter.length);
  expect(allCardsBefore).toEqual(allCardsAfter);
});

test("refreshing market with few cards left", async () => {
  const { send, getState } = getTestActor();
  const { animalMarket } = getState();

  send({
    type: "iddqd",
    context: {
      animalMarket: {
        ...animalMarket,
        deck: animalMarket.deck.slice(0, 2),
        table: animalMarket.table.slice(0, 4),
      },
    },
  });

  const stateBefore = getState();
  const token = stateBefore.players[0].abilities.find(({ name }) => name === "refresh")!;
  const deckBefore = stateBefore.animalMarket.deck;
  const tableBefore = stateBefore.animalMarket.table;
  const allCardsBefore = [...deckBefore, ...tableBefore].sort(compareCards);

  send({ type: "user.click.token", token });
  send({ type: "user.click.market.deck.animal" });

  const stateAfter = getState();
  const deckAfter = stateAfter.animalMarket.deck;
  const tableAfter = stateAfter.animalMarket.table;
  const allCardsAfter = [...deckAfter, ...tableAfter].sort(compareCards);

  expect(deckAfter[0].uid).not.toBe(deckBefore[0].uid);
  expect(deckBefore.length).toBe(deckAfter.length);
  expect(tableBefore.length).toBe(tableAfter.length);
  expect(allCardsBefore.length).toBe(allCardsAfter.length);
  expect(allCardsBefore).toEqual(allCardsAfter);
});

test("using a token marks it as used", async () => {
  const { send, getState } = getTestActor();

  const stateBefore = getState();
  const token = stateBefore.players[0].abilities.find(({ name }) => name === "plus")!;

  send({ type: "user.click.token", token });

  const stateAfter = getState();

  expect(stateAfter.players[0].abilities.find(({ uid }) => uid === token.uid)?.isUsed).toBe(true);
});
