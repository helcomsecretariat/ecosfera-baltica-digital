import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { concat, filter, find } from "lodash";

test("restoring singeplayer single ability", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  stateBefore.players[0].abilities[0].isUsed = true;

  const specialCards = filter(stateBefore.plantMarket.deck, (plantDeckCard) =>
    plantDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const bubbleCurtainsCard = find(stateBefore.policyMarket.deck, { name: "Bubble curtains" })!;
  stateBefore.policyMarket.deck = [fundingCard, bubbleCurtainsCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: bubbleCurtainsCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].abilities.every((ability) => ability.isUsed === false)).toBe(true);
});

test("restoring singeplayer abilities when no abilities have been used", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  const specialCards = filter(stateBefore.plantMarket.deck, (plantDeckCard) =>
    plantDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const bubbleCurtainsCard = find(stateBefore.policyMarket.deck, { name: "Bubble curtains" })!;
  stateBefore.policyMarket.deck = [fundingCard, bubbleCurtainsCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: bubbleCurtainsCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].abilities.every((ability) => ability.isUsed === false)).toBe(true);
});

test("restoring singeplayer multiple abilities", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  stateBefore.players[0].abilities = stateBefore.players[0].abilities.map((ability) => {
    return { ...ability, isUsed: true };
  });

  const specialCards = filter(stateBefore.plantMarket.deck, (plantDeckCard) =>
    plantDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const bubbleCurtainsCard = find(stateBefore.policyMarket.deck, { name: "Bubble curtains" })!;
  stateBefore.policyMarket.deck = [fundingCard, bubbleCurtainsCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: bubbleCurtainsCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].abilities.every((ability) => ability.isUsed === false)).toBe(true);
});

test("restoring multiplayer abilities", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => {
    return {
      ...player,
      abilities: player.abilities.map((ability) => {
        return { ...ability, isUsed: true };
      }),
    };
  });

  const specialCards = filter(stateBefore.plantMarket.deck, (plantDeckCard) =>
    plantDeckCard.abilities.includes("special"),
  ).slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, specialCards);
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  const bubbleCurtainsCard = find(stateBefore.policyMarket.deck, { name: "Bubble curtains" })!;
  stateBefore.policyMarket.deck = [fundingCard, bubbleCurtainsCard];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCards[0], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.player.hand.card.token", card: specialCards[1], abilityName: "special" });
  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.policy.card.acquired", card: bubbleCurtainsCard });
  send({ type: "user.click.stage.confirm" });

  const state = getState();
  expect(state.players[0].abilities.every((ability) => ability.isUsed === false)).toBe(true);
});
