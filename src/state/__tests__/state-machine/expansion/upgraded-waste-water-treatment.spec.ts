import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { filter } from "lodash";

// Test skipped for now because it conflicts with the conditions for elemental disaster
test.skip("nutrient to market when player has 3 nutrients", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
  });
  const stateBefore = getState();

  const marketNutrients = filter(stateBefore.elementMarket.deck, { name: "nutrients" }).slice(0, 3);
  stateBefore.players[0].hand = marketNutrients;

  activatePolicy({
    policyName: "Upgraded waste water treatment",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);

  const marketNutrientsBefore = filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length;
  const marketNutrientsAfter = filter(state.elementMarket.deck, { name: "nutrients" }).length;
  const playerNutrientsBefore = filter(stateBefore.players[0].hand, { name: "nutrients" }).length;
  const playerNutrientsAfter = filter(state.players[0].hand, { name: "nutrients" }).length;

  expect(marketNutrientsAfter - marketNutrientsBefore).toBe(1);
  expect(playerNutrientsAfter - playerNutrientsBefore).toBe(-1);
});

test("player gets additional nutrient", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name === "nutrients",
  ).slice(0, 1);

  activatePolicy({
    policyName: "Upgraded waste water treatment",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);

  const marketNutrientsBefore = filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length;
  const marketNutrientsAfter = filter(state.elementMarket.deck, { name: "nutrients" }).length;
  const playerNutrientsBefore = filter(stateBefore.players[0].hand, { name: "nutrients" }).length;
  const playerNutrientsAfter = filter(state.players[0].hand, { name: "nutrients" }).length;

  expect(marketNutrientsAfter - marketNutrientsBefore).toBe(-1);
  expect(playerNutrientsAfter - playerNutrientsBefore).toBe(1);
});

test("player gets no additional nutrient when deck is empty", async () => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name === "nutrients",
  ).slice(0, 1);
  stateBefore.elementMarket.deck = filter(stateBefore.elementMarket.deck, (card) => card.name !== "nutrients");

  activatePolicy({
    policyName: "Upgraded waste water treatment",
    stateBefore,
  });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);

  const marketNutrientsBefore = filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length;
  const marketNutrientsAfter = filter(state.elementMarket.deck, { name: "nutrients" }).length;
  const playerNutrientsBefore = filter(stateBefore.players[0].hand, { name: "nutrients" }).length;
  const playerNutrientsAfter = filter(state.players[0].hand, { name: "nutrients" }).length;

  expect(marketNutrientsAfter - marketNutrientsBefore).toBe(0);
  expect(playerNutrientsAfter - playerNutrientsBefore).toBe(0);
});
