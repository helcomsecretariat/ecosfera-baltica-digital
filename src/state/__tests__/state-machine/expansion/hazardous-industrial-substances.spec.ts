import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { concat, filter, find } from "lodash";
import { PlantCard } from "@/state/types";

test("discarding plant market", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const tablePlants = stateBefore.plantMarket.table;

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hazardous substances from industry" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.plantMarket.table.some((tableCard) => tablePlants.includes(tableCard))).toBe(false);
  expect(tablePlants.every((tablePlant) => state.plantMarket.deck.includes(tablePlant))).toBe(true);
  expect(state.plantMarket.table.some((tableCard) => state.plantMarket.deck.includes(tableCard))).toBe(false);
  expect(state.plantMarket.table).toHaveLength(4);
});

test("discarding plant market when deck is empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const tablePlants = stateBefore.plantMarket.table;

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hazardous substances from industry" });

  stateBefore.plantMarket.deck = [];

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.plantMarket.table.some((tableCard) => tablePlants.includes(tableCard))).toBe(false);
  expect(tablePlants.every((tablePlant) => state.plantMarket.deck.includes(tablePlant))).toBe(true);
  expect(state.plantMarket.table.some((tableCard) => state.plantMarket.deck.includes(tableCard))).toBe(false);
  expect(state.plantMarket.table).toHaveLength(0);
});

test("discarding plant market when deck is partially empty", async () => {
  const { send, getState } = getTestActor({}, true);
  const stateBefore = getState();
  const tablePlants = stateBefore.plantMarket.table;

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hazardous substances from industry" });

  stateBefore.plantMarket.deck = stateBefore.plantMarket.deck.slice(-2);

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.plantMarket.table.some((tableCard) => tablePlants.includes(tableCard))).toBe(false);
  expect(tablePlants.every((tablePlant) => state.plantMarket.deck.includes(tablePlant))).toBe(true);
  expect(state.plantMarket.table.some((tableCard) => state.plantMarket.deck.includes(tableCard))).toBe(false);
  expect(state.plantMarket.table).toHaveLength(2);
});

test("discarding singleplayer with plants", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();
  const plantCards = stateBefore.plantMarket.table.slice(0, 2);
  stateBefore.players[0].hand = concat(stateBefore.players[0].hand, plantCards);

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hazardous substances from industry" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(
    (filter(state.players[0].hand, { type: "plant" }) as PlantCard[]).some((playerCard) =>
      plantCards.includes(playerCard),
    ),
  ).toBe(false);
  expect(plantCards.every((plantCard) => state.players[0].discard.includes(plantCard))).toBe(true);
  expect(state.players[0].hand).toHaveLength(5);
});

test("discarding multiplayer with plants", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();
  const plantCards = stateBefore.plantMarket.table.slice(0, 4);
  stateBefore.players.forEach((player, index) => {
    player.hand.push(plantCards[index]);
  });

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hazardous substances from industry" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(
    state.players.every((player) =>
      (filter(player.hand, { type: "plant" }) as PlantCard[]).every((playerCard) => !plantCards.includes(playerCard)),
    ),
  ).toBe(true);
  expect(state.players.every((player, index) => player.discard.includes(plantCards[index]))).toBe(true);
  expect(state.players[0].hand).toHaveLength(5);
  expect(state.players.slice(1, 4).every((player) => player.hand.length === 4)).toBe(true);
});

test("discarding singleplayer without plants", async () => {
  const { send, getState } = getTestActor({}, true, 1);
  const stateBefore = getState();

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hazardous substances from industry" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(5);
});

test("discarding multiplayer without plants", async () => {
  const { send, getState } = getTestActor({}, true, 4);
  const stateBefore = getState();

  const specialCard = find(stateBefore.animalMarket.deck, (animalDeckCard) =>
    animalDeckCard.abilities.includes("special"),
  )!;
  stateBefore.players[0].hand.push(specialCard);
  stateBefore.policyMarket.deck = filter(stateBefore.policyMarket.deck, { name: "Hazardous substances from industry" });

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.hand.card.token", card: specialCard, abilityName: "special" });

  let state = getState();
  send({ type: "user.click.stage.confirm" });

  state = getState();
  expect(state.players[0].hand).toHaveLength(5);
  expect(state.players.slice(1, 4).every((player) => player.hand.length === 4)).toBe(true);
});
