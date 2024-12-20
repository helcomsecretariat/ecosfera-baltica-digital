import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { concat, every, filter, find, some, without } from "lodash";

testRandomSeed("moving mud species to self", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  stateBefore.plantMarket.deck = concat(stateBefore.plantMarket.deck, stateBefore.plantMarket.table);
  stateBefore.plantMarket.table = [];
  stateBefore.animalMarket.deck = concat(stateBefore.animalMarket.deck, stateBefore.animalMarket.table);
  stateBefore.animalMarket.table = [];

  const mudAnimals = filter(stateBefore.animalMarket.deck, (card) => card.habitats.includes("mud")).slice(0, 4);
  stateBefore.animalMarket.table = mudAnimals;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...mudAnimals);

  const mudPlants = filter(stateBefore.plantMarket.deck, (card) => card.habitats.includes("mud")).slice(0, 4);
  stateBefore.plantMarket.table = mudPlants;
  stateBefore.plantMarket.deck = without(stateBefore.plantMarket.deck, ...mudPlants);

  activatePolicy({
    policyName: "Fishing gear regulation",
    stateBefore,
  });

  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const state = getState();
  expect(every(stateBefore.animalMarket.table, (animalCard) => state.animalMarket.table.includes(animalCard))).toBe(
    false,
  );
  expect(state.animalMarket.table).toHaveLength(4);
  expect(every(stateBefore.plantMarket.table, (plantCard) => state.plantMarket.table.includes(plantCard))).toBe(false);
  expect(state.plantMarket.table).toHaveLength(4);
  expect(every(stateBefore.animalMarket.table, (animalCard) => state.players[0].hand.includes(animalCard))).toBe(true);
  expect(every(stateBefore.plantMarket.table, (plantCard) => state.players[0].hand.includes(plantCard))).toBe(true);
});

testRandomSeed("moving mud species to other player", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  stateBefore.plantMarket.deck = concat(stateBefore.plantMarket.deck, stateBefore.plantMarket.table);
  stateBefore.plantMarket.table = [];
  stateBefore.animalMarket.deck = concat(stateBefore.animalMarket.deck, stateBefore.animalMarket.table);
  stateBefore.animalMarket.table = [];

  const mudAnimals = filter(stateBefore.animalMarket.deck, (card) => card.habitats.includes("mud")).slice(0, 4);
  stateBefore.animalMarket.table = mudAnimals;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...mudAnimals);

  const mudPlants = filter(stateBefore.plantMarket.deck, (card) => card.habitats.includes("mud")).slice(0, 4);
  stateBefore.plantMarket.table = mudPlants;
  stateBefore.plantMarket.deck = without(stateBefore.plantMarket.deck, ...mudPlants);

  activatePolicy({
    policyName: "Fishing gear regulation",
    stateBefore,
  });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[1].hand[0] });

  const state = getState();
  expect(every(stateBefore.animalMarket.table, (animalCard) => state.animalMarket.table.includes(animalCard))).toBe(
    false,
  );
  expect(state.animalMarket.table).toHaveLength(4);
  expect(every(stateBefore.plantMarket.table, (plantCard) => state.plantMarket.table.includes(plantCard))).toBe(false);
  expect(state.plantMarket.table).toHaveLength(4);
  expect(every(stateBefore.animalMarket.table, (animalCard) => state.players[1].hand.includes(animalCard))).toBe(true);
  expect(every(stateBefore.plantMarket.table, (plantCard) => state.players[1].hand.includes(plantCard))).toBe(true);
});

testRandomSeed("no mud species in market", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  stateBefore.animalMarket.table = filter(
    [...stateBefore.animalMarket.table, ...stateBefore.animalMarket.deck],
    (card) => !card.habitats.includes("mud"),
  ).slice(0, 4);
  stateBefore.plantMarket.table = filter(
    [...stateBefore.plantMarket.table, ...stateBefore.plantMarket.deck],
    (card) => !card.habitats.includes("mud"),
  ).slice(0, 4);

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const fishingGearRegulationCard = find(stateBefore.policyMarket.deck, {
    name: "Fishing gear regulation",
  })!;
  stateBefore.policyMarket.deck = [fundingCard, fishingGearRegulationCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  activatePolicy({
    policyName: "Fishing gear regulation",
    stateBefore,
  });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[1].hand[0] });

  const state = getState();
  expect(every(stateBefore.animalMarket.table, (animalCard) => state.animalMarket.table.includes(animalCard))).toBe(
    true,
  );
  expect(state.animalMarket.table).toHaveLength(4);
  expect(every(stateBefore.plantMarket.table, (plantCard) => state.plantMarket.table.includes(plantCard))).toBe(true);
  expect(state.plantMarket.table).toHaveLength(4);
  expect(some(stateBefore.animalMarket.table, (animalCard) => state.players[1].hand.includes(animalCard))).toBe(false);
  expect(some(stateBefore.plantMarket.table, (plantCard) => state.players[1].hand.includes(plantCard))).toBe(false);
});
