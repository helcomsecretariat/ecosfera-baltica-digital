import { removeOne } from "@/lib/utils";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { getSharedHabitats } from "@/state/machines/helpers/turn";
import { ElementCard, PlantCard } from "@/state/types";
import { intersection, without } from "lodash";
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

testRandomSeed("playing animal cards with shared habitats should unlock habitats", (seed) => {
  const { send, getState } = getTestActor({ seed });
  const stateBefore = getState();

  const animalCardsWithSharedHabitat = stateBefore.animalMarket.deck
    .filter((animal) => {
      const habitat = animal.habitats[0];
      return stateBefore.animalMarket.table.some((otherAnimal) => otherAnimal.habitats.includes(habitat));
    })
    .slice(0, 2);
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, ...animalCardsWithSharedHabitat);
  stateBefore.players[0].hand = animalCardsWithSharedHabitat;
  const sharedHabitats = getSharedHabitats(animalCardsWithSharedHabitat);

  send({ type: "iddqd", context: stateBefore });

  animalCardsWithSharedHabitat.forEach((animal) => {
    send({ type: "user.click.player.hand.card", card: animal });
  });

  const stateAfter = getState();
  expect(
    sharedHabitats.every((habitat) => stateAfter.habitatMarket.deck.find((h) => h.name === habitat)?.isAcquired),
  ).toBe(true);
});

testRandomSeed("playing animal cards without shared habitats should not unlock habitats", (seed) => {
  const { send, getState } = getTestActor({ seed });
  const stateBefore = getState();

  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const pelagicAnimal = removeOne(
    stateBefore.animalMarket.deck,
    (animal) => animal.habitats.length === 1 && animal.habitats.includes("pelagic"),
  )!;
  const nonMatchingAnimal = removeOne(stateBefore.animalMarket.deck, (animal) =>
    animal.habitats.every((habitat) => !pelagicAnimal.habitats.includes(habitat)),
  )!;
  stateBefore.players[0].hand = [pelagicAnimal, nonMatchingAnimal];

  send({ type: "iddqd", context: stateBefore });

  send({ type: "user.click.player.hand.card", card: pelagicAnimal });
  send({ type: "user.click.player.hand.card", card: nonMatchingAnimal });

  const stateAfter = getState();
  expect(stateAfter.habitatMarket.deck.some((habitat) => habitat.isAcquired)).toBe(false);
  expect(stateAfter.turn.playedCards).toHaveLength(2);
});

testRandomSeed(
  "when playing 3 animals in sequence: non-matching, matching, matching - only habitats shared by matching animals are unlocked",
  (seed) => {
    const { send, getState } = getTestActor({ seed });
    const stateBefore = getState();

    stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
    stateBefore.animalMarket.table = [];
    const pelagicAnimal = removeOne(
      stateBefore.animalMarket.deck,
      (animal) => animal.habitats.length === 1 && animal.habitats.includes("pelagic"),
    )!;
    const nonMatchingAnimal = removeOne(stateBefore.animalMarket.deck, (animal) =>
      animal.habitats.every((habitat) => !pelagicAnimal.habitats.includes(habitat)),
    )!;
    const pelagicAnimal2 = removeOne(
      stateBefore.animalMarket.deck,
      (animal) =>
        animal.habitats.includes("pelagic") &&
        animal.habitats.every((habitat) => !nonMatchingAnimal.habitats.includes(habitat)),
    )!;
    stateBefore.players[0].hand = [pelagicAnimal, pelagicAnimal2, nonMatchingAnimal];

    send({ type: "iddqd", context: stateBefore });

    send({ type: "user.click.player.hand.card", card: nonMatchingAnimal });
    send({ type: "user.click.player.hand.card", card: pelagicAnimal });
    send({ type: "user.click.player.hand.card", card: pelagicAnimal2 });

    const stateAfter = getState();
    expect(stateAfter.habitatMarket.deck.find((habitat) => habitat.name === "pelagic")?.isAcquired).toBe(true);
    expect(stateAfter.turn.playedCards).toHaveLength(1);
  },
);

testRandomSeed(
  "when playing 3 animals in sequence: matching, non-matching, matching - only habitats shared by matching animals are unlocked",
  (seed) => {
    const { send, getState } = getTestActor({ seed });
    const stateBefore = getState();

    stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
    stateBefore.animalMarket.table = [];
    const pelagicAnimal = removeOne(
      stateBefore.animalMarket.deck,
      (animal) => animal.habitats.length === 1 && animal.habitats.includes("pelagic"),
    )!;
    const nonMatchingAnimal = removeOne(stateBefore.animalMarket.deck, (animal) =>
      animal.habitats.every((habitat) => !pelagicAnimal.habitats.includes(habitat)),
    )!;
    const pelagicAnimal2 = removeOne(
      stateBefore.animalMarket.deck,
      (animal) =>
        animal.habitats.includes("pelagic") &&
        animal.habitats.every((habitat) => !nonMatchingAnimal.habitats.includes(habitat)),
    )!;
    stateBefore.players[0].hand = [pelagicAnimal, pelagicAnimal2, nonMatchingAnimal];

    send({ type: "iddqd", context: stateBefore });

    send({ type: "user.click.player.hand.card", card: pelagicAnimal });
    send({ type: "user.click.player.hand.card", card: nonMatchingAnimal });
    send({ type: "user.click.player.hand.card", card: pelagicAnimal2 });

    const stateAfter = getState();
    expect(stateAfter.habitatMarket.deck.find((habitat) => habitat.name === "pelagic")?.isAcquired).toBe(true);
    expect(stateAfter.turn.playedCards).toHaveLength(1);
  },
);

testRandomSeed("playing animals with multiple shared habitats should unlock all shared habitats", (seed) => {
  const { send, getState } = getTestActor({ seed });
  const stateBefore = getState();

  const multiHabitatAnimals = stateBefore.animalMarket.deck
    .filter((animal) => {
      const sharedWith = stateBefore.animalMarket.deck.filter((other) => {
        if (other.uid === animal.uid) return false;
        const shared = intersection(animal.habitats, other.habitats);
        return shared.length >= 2;
      });
      return sharedWith.length > 0;
    })
    .slice(0, 2);

  stateBefore.players[0].hand = multiHabitatAnimals;

  send({ type: "iddqd", context: stateBefore });

  multiHabitatAnimals.forEach((animal) => {
    send({ type: "user.click.player.hand.card", card: animal });
  });

  const stateAfter = getState();
  const sharedHabitats = getSharedHabitats(multiHabitatAnimals);

  expect(
    sharedHabitats.every(
      (habitat) => stateAfter.habitatMarket.deck.find((habitatTile) => habitatTile.name === habitat)?.isAcquired,
    ),
  ).toBe(true);
});

testRandomSeed("playing animals with different habitat groups should unlock all matching habitat pairs", (seed) => {
  const { send, getState } = getTestActor({ seed });
  const stateBefore = getState();

  const pelagicAnimals = stateBefore.animalMarket.deck
    .filter((animal) => animal.habitats.includes("pelagic") && !animal.habitats.includes("coast"))
    .slice(0, 2);

  const coastalAnimals = stateBefore.animalMarket.deck
    .filter((animal) => animal.habitats.includes("coast") && !animal.habitats.includes("pelagic"))
    .slice(0, 2);

  stateBefore.players[0].hand = [...pelagicAnimals, ...coastalAnimals];

  send({ type: "iddqd", context: stateBefore });

  pelagicAnimals.forEach((animal) => {
    send({ type: "user.click.player.hand.card", card: animal });
  });

  let stateAfter = getState();
  expect(stateAfter.habitatMarket.deck.find((habitat) => habitat.name === "pelagic")?.isAcquired).toBe(true);

  send({ type: "user.click.stage.confirm" });

  coastalAnimals.forEach((animal) => {
    send({ type: "user.click.player.hand.card", card: animal });
  });

  stateAfter = getState();
  expect(stateAfter.habitatMarket.deck.find((habitat) => habitat.name === "coast")?.isAcquired).toBe(true);
  expect(stateAfter.turn.exhaustedCards).toHaveLength(4);
});
