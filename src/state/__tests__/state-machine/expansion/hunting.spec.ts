import { expect, test } from "vitest";
import { activatePolicy, getTestActor } from "../../utils";
import { remove } from "lodash";

test("removing birds from hand", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const birds = remove(stateBefore.animalMarket.deck, { faunaType: "bird" });
  const handBeforeAddingBirds = [...stateBefore.players[0].hand];
  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...birds];

  activatePolicy(stateBefore, send, "Hunting");

  const state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(state.players[0].hand).toEqual(handBeforeAddingBirds);
});

test("removing mammals from hand", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const specialCards = remove(stateBefore.plantMarket.deck, { abilities: ["special"] });
  const mammals = remove(stateBefore.animalMarket.deck, { faunaType: "mammal" });

  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...specialCards];
  const handBeforeAddingMammals = [...stateBefore.players[0].hand];
  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...mammals];

  activatePolicy(stateBefore, send, "Hunting");

  const state = getState();
  expect(state.players[0].hand).toEqual(handBeforeAddingMammals);
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
});

test("removing birds and mammals from hand", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const birds = remove(stateBefore.animalMarket.deck, { faunaType: "bird" });
  const mammals = remove(stateBefore.animalMarket.deck, { faunaType: "mammal" });
  const handBeforeAddingAnimals = [...stateBefore.players[0].hand];
  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...birds, ...mammals];

  activatePolicy(stateBefore, send, "Hunting");

  const state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
  expect(state.players[0].hand).toEqual(handBeforeAddingAnimals);
});

test("removing when hand contains no birds or mammals", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const handBefore = [...stateBefore.players[0].hand];

  activatePolicy(stateBefore, send, "Hunting");

  const state = getState();
  expect(state.players[0].hand).toEqual(handBefore);
});

test("other animals remain in hand after hunting", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  const birds = remove(stateBefore.animalMarket.deck, { faunaType: "bird" });
  const mammals = remove(stateBefore.animalMarket.deck, { faunaType: "mammal" });
  const reptiles = remove(stateBefore.animalMarket.deck, { faunaType: "zoobenthos" });

  stateBefore.players[0].hand = [...stateBefore.players[0].hand, ...reptiles, ...birds, ...mammals];

  activatePolicy(stateBefore, send, "Hunting");

  const state = getState();
  expect(birds.some((bird) => state.players[0].hand.includes(bird))).toBe(false);
  expect(mammals.some((mammal) => state.players[0].hand.includes(mammal))).toBe(false);
  expect(reptiles.every((reptile) => state.players[0].hand.includes(reptile))).toBe(true);
});
