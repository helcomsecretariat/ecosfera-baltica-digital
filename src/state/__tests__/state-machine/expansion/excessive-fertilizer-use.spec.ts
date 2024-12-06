import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";

test("distributing nutrient cards to active player", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();

  stateBefore.players[0].hand = [...stateBefore.players[0].deck, ...stateBefore.players[0].hand]
    .filter((card) => card.name !== "nutrients")
    .slice(0, 4);

  activatePolicy({
    policyName: "Excessive fertiliser use",
    stateBefore,
  });

  const state = getState();
  const marketNutrientsBefore = stateBefore.elementMarket.deck.filter((card) => card.name === "nutrients").length;
  const marketNutrientsAfter = state.elementMarket.deck.filter((card) => card.name === "nutrients").length;
  const playerNutrientsBefore = stateBefore.players[0].hand.filter((card) => card.name === "nutrients").length;
  const playerNutrientsAfter = state.players[0].hand.filter((card) => card.name === "nutrients").length;

  expect(marketNutrientsBefore - marketNutrientsAfter).toBe(2);
  expect(playerNutrientsAfter - playerNutrientsBefore).toBe(2);
});

test("distributing disaster card to active player", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();

  stateBefore.players[0].hand = [...stateBefore.players[0].deck, ...stateBefore.players[0].hand]
    .filter((card) => card.name !== "nutrients" && card.type !== "disaster")
    .slice(0, 4);

  stateBefore.elementMarket.deck = [...stateBefore.elementMarket.deck]
    .filter((card) => card.name !== "nutrients")
    .concat([...stateBefore.elementMarket.deck].filter((card) => card.name === "nutrients").slice(0, 1));

  activatePolicy({
    policyName: "Excessive fertiliser use",
    stateBefore,
  });

  const state = getState();
  const nutrientsBefore = stateBefore.elementMarket.deck.filter((card) => card.name === "nutrients").length;
  const nutrientsAfter = state.elementMarket.deck.filter((card) => card.name === "nutrients").length;

  expect(nutrientsBefore - nutrientsAfter).toBe(0);
  expect(stateBefore.players[0].hand.filter((card) => card.type === "disaster").length).toBe(0);
  expect(state.players[0].hand.filter((card) => card.type === "disaster").length).toBe(1);
});

test("removing oxygen cards from hands", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();

  const oxygenCards = [...stateBefore.elementMarket.deck]
    .filter((card) => card.name === "oxygen")
    .slice(0, stateBefore.players.length);

  stateBefore.players = stateBefore.players.map((player, index) => ({
    ...player,
    hand: [oxygenCards[index]],
  }));

  stateBefore.elementMarket.deck = [...stateBefore.elementMarket.deck].filter((card) => !oxygenCards.includes(card));

  activatePolicy({
    policyName: "Excessive fertiliser use",
    stateBefore,
  });

  const state = getState();
  const oxygenBefore = stateBefore.elementMarket.deck.filter((card) => card.name === "oxygen").length;
  const oxygenAfter = state.elementMarket.deck.filter((card) => card.name === "oxygen").length;

  expect(oxygenAfter - oxygenBefore).toBe(4);

  stateBefore.players.forEach((player) => expect(player.hand.filter((card) => card.name === "oxygen").length).toBe(1));
  state.players.forEach((player) => expect(player.hand.filter((card) => card.name === "oxygen").length).toBe(0));
});
