import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { remove } from "lodash";

testRandomSeed("removing birds from hand", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();
  const birds = remove(stateBefore.animalMarket.deck, { faunaType: "bird" });
  const handBeforeAddingBirds = [...stateBefore.players[0].hand];
  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...birds];

  activatePolicy({
    policyName: "Hunting",
    stateBefore,
  });

  const state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(handBeforeAddingBirds.every((card) => state.players[0].hand.includes(card))).toBe(true);
});

testRandomSeed("removing mammals from hand", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();
  const specialCards = remove(stateBefore.plantMarket.deck, { abilities: ["special"] });
  const mammals = remove(stateBefore.animalMarket.deck, { faunaType: "mammal" });

  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...specialCards];
  const handBeforeAddingMammals = [...stateBefore.players[0].hand];
  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...mammals];

  activatePolicy({
    policyName: "Hunting",
    stateBefore,
  });

  const state = getState();
  expect(handBeforeAddingMammals.every((card) => state.players[0].hand.includes(card))).toBe(true);
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
});

testRandomSeed("removing birds and mammals from hand", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();
  const birds = remove(stateBefore.animalMarket.deck, { faunaType: "bird" });
  const mammals = remove(stateBefore.animalMarket.deck, { faunaType: "mammal" });
  const handBeforeAddingAnimals = [...stateBefore.players[0].hand];
  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...birds, ...mammals];

  activatePolicy({
    policyName: "Hunting",
    stateBefore,
    specialCardSource: "plants",
  });

  const state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
  expect(handBeforeAddingAnimals.every((card) => state.players[0].hand.includes(card))).toBe(true);
});

testRandomSeed("removing when hand contains no birds or mammals", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  activatePolicy({
    policyName: "Hunting",
    stateBefore,
    specialCardSource: "plants",
  });

  const state = getState();
  expect(state.players[0].hand).toHaveLength(5);
  expect(state.players[0].hand.filter((card) => card.type === "animal")).toHaveLength(0);
});

testRandomSeed("other animals remain in hand after hunting", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  const birds = remove(stateBefore.animalMarket.deck, { faunaType: "bird" });
  const mammals = remove(stateBefore.animalMarket.deck, { faunaType: "mammal" });
  const reptiles = remove(stateBefore.animalMarket.deck, { faunaType: "zoobenthos" });

  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...reptiles, ...birds, ...mammals];

  activatePolicy({
    policyName: "Hunting",
    stateBefore,
  });

  const state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
  expect(reptiles.every((reptile) => state.players[0].hand.includes(reptile))).toBe(true);
});
