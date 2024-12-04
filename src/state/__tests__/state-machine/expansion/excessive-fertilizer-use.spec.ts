import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { every, filter, find, without } from "lodash";

test("distributing nutrient cards to active player", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name !== "nutrients",
  ).slice(0, 4);

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Excessive fertiliser use" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(2);
  expect(filter(state.players[0].hand, { name: "nutrients" })).toHaveLength(2);
});

test("distributing disaster card to active player", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();

  stateBefore.players[0].hand = filter(
    [...stateBefore.players[0].deck, ...stateBefore.players[0].hand],
    (card) => card.name !== "nutrients" && card.type !== "disaster",
  ).slice(0, 4);
  stateBefore.elementMarket.deck = [
    ...filter(stateBefore.elementMarket.deck, (card) => card.name !== "nutrients"),
    ...filter(stateBefore.elementMarket.deck, { name: "nutrients" }).slice(0, 1),
  ];

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Excessive fertiliser use" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(stateBefore.elementMarket.deck, { name: "nutrients" }).length -
      filter(state.elementMarket.deck, { name: "nutrients" }).length,
  ).toBe(0);
  expect(filter(stateBefore.players[0].hand, { type: "disaster" })).toHaveLength(0);
  expect(filter(state.players[0].hand, { type: "disaster" })).toHaveLength(1);
});

test("removing oxygen cards from hands", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();

  const oxygenCards = filter(stateBefore.elementMarket.deck, { name: "oxygen" }).slice(0, stateBefore.players.length);
  stateBefore.players = stateBefore.players.map((player, index) => {
    return { ...player, hand: [oxygenCards[index]] };
  });
  stateBefore.elementMarket.deck = without(stateBefore.elementMarket.deck, ...oxygenCards);

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Excessive fertiliser use" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(
    filter(state.elementMarket.deck, { name: "oxygen" }).length -
      filter(stateBefore.elementMarket.deck, { name: "oxygen" }).length,
  ).toBe(4);
  expect(every(stateBefore.players, (player) => filter(player.hand, { name: "oxygen" }).length === 1)).toBe(true);
  expect(every(state.players, (player) => filter(player.hand, { name: "oxygen" }).length === 0)).toBe(true);
});
