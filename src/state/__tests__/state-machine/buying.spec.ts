import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { ElementCard, PlantCard } from "@/state/types";
import { expect } from "vitest";

testRandomSeed("buying card from plant market when deck is empty", (seed) => {
  const { send, getState } = getTestActor({ seed });
  const stateBefore = getState();

  const cardToBuy = stateBefore.plantMarket.table[0];

  const requiredElements = cardToBuy.elements;
  const elementCards: ElementCard[] = [];
  requiredElements.forEach((element) => {
    const card = stateBefore.elementMarket.deck.find(
      (card) => card.name === element && !elementCards.some((existingCard) => existingCard.uid === card.uid),
    );
    if (card) elementCards.push(card);
  });
  stateBefore.players[0].hand = elementCards;
  stateBefore.plantMarket.deck = [];

  send({ type: "iddqd", context: stateBefore });

  let stateAfter = getState();
  elementCards.forEach((card) => {
    send({ type: "user.click.player.hand.card", card });
  });

  send({ type: "user.click.market.table.card", card: cardToBuy });
  send({ type: "user.click.stage.confirm" });

  stateAfter = getState();
  expect(stateAfter.players[0].hand).toContainEqual(cardToBuy);
  expect(stateAfter.plantMarket.table).not.toContainEqual(cardToBuy);
  expect(stateAfter.plantMarket.table).toHaveLength(3);
});

testRandomSeed("buying card from animal market when deck is empty", (seed) => {
  const { send, getState } = getTestActor({ seed });
  const stateBefore = getState();

  const cardToBuy = stateBefore.animalMarket.table[0];

  const requiredHabitat = cardToBuy.habitats[0];
  const plantCards: PlantCard[] = stateBefore.plantMarket.deck
    .filter((card) => card.habitats.includes(requiredHabitat))
    .slice(0, 2);
  stateBefore.players[0].hand = plantCards;
  stateBefore.animalMarket.deck = [];

  send({ type: "iddqd", context: stateBefore });

  let stateAfter = getState();
  plantCards.forEach((card) => {
    send({ type: "user.click.player.hand.card", card });
  });

  send({ type: "user.click.market.table.card", card: cardToBuy });
  send({ type: "user.click.stage.confirm" });

  stateAfter = getState();
  expect(stateAfter.players[0].hand).toContainEqual(cardToBuy);
  expect(stateAfter.animalMarket.table).not.toContainEqual(cardToBuy);
  expect(stateAfter.animalMarket.table).toHaveLength(3);
});
