import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { map } from "lodash";

test("can unborrow resource card", async () => {
  const { send, getState } = getTestActor();

  const stateBefore = getState();

  send({ type: "user.click.market.deck.element", name: stateBefore.elementMarket.deck[0].name });

  const stateAfterFirstBorrow = getState();

  send({ type: "user.click.market.deck.element", name: stateAfterFirstBorrow.elementMarket.deck[0].name });

  const stateAfterSecondBorrow = getState();

  expect(stateAfterSecondBorrow.turn.borrowedElement).not.toEqual(stateAfterFirstBorrow.turn.borrowedElement);
});

test("borrow only one card at a time and doesn't change deck length", async () => {
  const { send, getState } = getTestActor();

  const stateBefore = getState();
  const elementNames = [...new Set(map(stateBefore.elementMarket.deck, "name"))];
  const expectedDeckLength = stateBefore.elementMarket.deck.length - 1;

  expect(getState().turn.borrowedElement).toBe(undefined);
  send({ type: "user.click.market.deck.element", name: elementNames[0] });

  const stateAfterFirstBorrow = getState();
  expect(stateAfterFirstBorrow.turn.borrowedElement?.name).toBe(elementNames[0]);
  expect(stateAfterFirstBorrow.elementMarket.deck.length).toBe(expectedDeckLength);

  send({ type: "user.click.market.deck.element", name: elementNames[1] });

  const stateAfterSecondBorrow = getState();
  expect(stateAfterSecondBorrow.turn.borrowedElement?.name).toBe(elementNames[1]);
  expect(stateAfterSecondBorrow.elementMarket.deck.length).toBe(expectedDeckLength);
});
