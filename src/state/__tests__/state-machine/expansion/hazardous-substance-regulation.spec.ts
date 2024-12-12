import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { concat, filter, first, without } from "lodash";
import i18n from "@/i18n";

testRandomSeed("having shared animal and plant in hand unlocks habitat", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
    seed,
  });
  const stateBefore = getState();

  stateBefore.plantMarket.deck = concat(stateBefore.plantMarket.deck, stateBefore.plantMarket.table);
  stateBefore.plantMarket.table = [];
  stateBefore.animalMarket.deck = concat(stateBefore.animalMarket.deck, stateBefore.animalMarket.table);
  stateBefore.animalMarket.table = [];

  const plantCard = first(filter(stateBefore.plantMarket.deck, (card) => card.habitats.includes("pelagic")))!;
  const animalCard = first(filter(stateBefore.animalMarket.deck, (card) => card.habitats.includes("pelagic")))!;

  stateBefore.players[0].hand.push(plantCard);
  stateBefore.players[0].hand.push(animalCard);
  stateBefore.plantMarket.deck = without(stateBefore.plantMarket.deck, plantCard);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, animalCard);

  activatePolicy({
    policyName: "Hazardous substance regulation",
    stateBefore,
    specialCardSource: "plants",
  });
  send({ type: "user.click.player.hand.card", card: plantCard });
  send({ type: "user.click.player.hand.card", card: animalCard });

  const state = getState();
  expect(state.commandBar).toBeUndefined();
  expect(
    state.habitatMarket.deck
      .filter((habitatTile) => habitatTile.isAcquired)
      .every(
        (habitatTile) =>
          habitatTile.name === "baltic" ||
          (plantCard.habitats.includes(habitatTile.name) && animalCard.habitats.includes(habitatTile.name)),
      ),
  );
});

testRandomSeed("cant select animal that doesn't share habitat", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  stateBefore.plantMarket.deck = concat(stateBefore.plantMarket.deck, stateBefore.plantMarket.table);
  stateBefore.plantMarket.table = [];
  stateBefore.animalMarket.deck = concat(stateBefore.animalMarket.deck, stateBefore.animalMarket.table);
  stateBefore.animalMarket.table = [];

  const plantCard = first(stateBefore.plantMarket.deck)!;
  const animalCard = first(
    filter(stateBefore.animalMarket.deck, (card) =>
      plantCard?.habitats.every((habitat) => !card.habitats.includes(habitat)),
    ),
  )!;
  stateBefore.players[0].hand.push(plantCard);
  stateBefore.players[0].hand.push(animalCard);
  stateBefore.plantMarket.deck = without(stateBefore.plantMarket.deck, plantCard);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, animalCard);

  activatePolicy({
    policyName: "Hazardous substance regulation",
    stateBefore,
    specialCardSource: "plants",
  });
  send({ type: "user.click.player.hand.card", card: plantCard });
  send({ type: "user.click.player.hand.card", card: animalCard });

  const state = getState();
  expect(state.commandBar).toBeDefined();
  expect(
    state.habitatMarket.deck.every((habitatTile) => habitatTile.name === "baltic" || !habitatTile.isAcquired),
  ).toBe(true);
});

testRandomSeed("can only select plant cards in own hand", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  stateBefore.plantMarket.deck = concat(stateBefore.plantMarket.deck, stateBefore.plantMarket.table);
  stateBefore.plantMarket.table = [];
  stateBefore.animalMarket.deck = concat(stateBefore.animalMarket.deck, stateBefore.animalMarket.table);
  stateBefore.animalMarket.table = [];

  const plantCards = filter(stateBefore.plantMarket.deck, (card) => card.habitats.includes("pelagic")).slice(0, 3)!;
  const animalCards = filter(stateBefore.animalMarket.deck, (card) => card.habitats.includes("pelagic")).slice(0, 3)!;

  stateBefore.plantMarket.deck = without(stateBefore.plantMarket.deck, ...plantCards);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...animalCards);

  stateBefore.players = stateBefore.players.map((player, index) => {
    return {
      ...player,
      hand:
        index === 0
          ? [...player.hand.slice(0, 3), animalCards[index]]
          : [...player.hand.slice(0, 2), plantCards[index], animalCards[index]],
    };
  });

  stateBefore.plantMarket.table.push(plantCards[0]);
  stateBefore.animalMarket.table.push(animalCards[0]);

  activatePolicy({
    policyName: "Hazardous substance regulation",
    stateBefore,
  });

  plantCards.forEach((plantCard) => {
    send({ type: "user.click.player.hand.card", card: plantCard });
    send({ type: "user.click.market.table.card", card: plantCard });
  });

  const state = getState();
  expect(state.commandBar?.text).toBe(i18n.t("deck.policies.hazardousSubstanceRegulation.pickProducerCommandBarText"));
  expect(
    state.habitatMarket.deck.every((habitatTile) => habitatTile.name === "baltic" || !habitatTile.isAcquired),
  ).toBe(true);
});

testRandomSeed("can only select animal cards in own hand", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 2, seed });
  const stateBefore = getState();

  stateBefore.plantMarket.deck = concat(stateBefore.plantMarket.deck, stateBefore.plantMarket.table);
  stateBefore.plantMarket.table = [];
  stateBefore.animalMarket.deck = concat(stateBefore.animalMarket.deck, stateBefore.animalMarket.table);
  stateBefore.animalMarket.table = [];

  const plantCards = filter(stateBefore.plantMarket.deck, (card) => card.habitats.includes("pelagic")).slice(0, 3)!;
  const animalCards = filter(stateBefore.animalMarket.deck, (card) => card.habitats.includes("pelagic")).slice(0, 3)!;

  stateBefore.plantMarket.deck = without(stateBefore.plantMarket.deck, ...plantCards);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...animalCards);

  stateBefore.players = stateBefore.players.map((player, index) => {
    return {
      ...player,
      hand:
        index === 0
          ? [...player.hand.slice(0, 3), plantCards[index], animalCards[index]]
          : [...player.hand.slice(0, 2), plantCards[index], animalCards[index]],
    };
  });

  stateBefore.plantMarket.table.push(plantCards[0]);
  stateBefore.animalMarket.table.push(animalCards[0]);

  activatePolicy({
    policyName: "Hazardous substance regulation",
    stateBefore,
  });
  send({ type: "user.click.player.hand.card", card: plantCards[0] });

  animalCards.slice(1).forEach((animalCard) => {
    send({ type: "user.click.player.hand.card", card: animalCard });
    send({ type: "user.click.market.table.card", card: animalCard });
  });

  const state = getState();
  expect(state.commandBar?.text).toBe(i18n.t("deck.policies.hazardousSubstanceRegulation.pickAnimalCommandBarText"));
  expect(
    state.habitatMarket.deck.every((habitatTile) => habitatTile.name === "baltic" || !habitatTile.isAcquired),
  ).toBe(true);
});
