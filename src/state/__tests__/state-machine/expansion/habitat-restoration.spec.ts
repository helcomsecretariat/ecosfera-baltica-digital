import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { concat, filter, find, without } from "lodash";

test("restoring extinction tile when none has been added", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const habitatRestorationCard = find(stateBefore.policyMarket.deck, { name: "Habitat restoration" })!;
  stateBefore.policyMarket.deck = [fundingCard, habitatRestorationCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: habitatRestorationCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(state.extinctMarket.deck).toHaveLength(6);
  expect(state.extinctMarket.table).toHaveLength(0);
});

test("restoring extinction tile", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  const extinctionTile = stateBefore.extinctMarket.deck[0];
  stateBefore.extinctMarket.deck = without(stateBefore.extinctMarket.deck, extinctionTile);
  stateBefore.extinctMarket.table.push(extinctionTile);

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const habitatRestorationCard = find(stateBefore.policyMarket.deck, { name: "Habitat restoration" })!;
  stateBefore.policyMarket.deck = [fundingCard, habitatRestorationCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: habitatRestorationCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(state.extinctMarket.deck).toHaveLength(6);
  expect(state.extinctMarket.table).toHaveLength(0);
});

test("restoring extinction tile with multiple extinction tiles added", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  const extinctionTiles = stateBefore.extinctMarket.deck.slice(0, 3);
  stateBefore.extinctMarket.deck = without(stateBefore.extinctMarket.deck, ...extinctionTiles);
  stateBefore.extinctMarket.table = concat(stateBefore.extinctMarket.table, extinctionTiles);

  const specialCards = filter(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const habitatRestorationCard = find(stateBefore.policyMarket.deck, { name: "Habitat restoration" })!;
  stateBefore.policyMarket.deck = [fundingCard, habitatRestorationCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: habitatRestorationCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.policyMarket.funding).toHaveLength(0);
  expect(state.extinctMarket.deck).toHaveLength(4);
  expect(state.extinctMarket.table).toHaveLength(2);
});
