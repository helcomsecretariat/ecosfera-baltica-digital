import { expect, test } from "vitest";
import { getTestActor } from "../../utils";
import { filter, find } from "lodash";

test("removing calanoida from animal table", async () => {
  const { getState, activatePolicy } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.name !== "Calanoida",
  ).slice(0, 3);
  stateBefore.animalMarket.table.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(state.animalMarket.table).not.toContain(calanoida);
  expect(state.animalMarket.table).toHaveLength(4);
});

test("removing calanoida from animal deck", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.animalMarket.deck.includes(calanoida)).toBe(false);
});

test("removing calanoida from player hand", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[0].hand.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[0].hand.includes(calanoida)).toBe(false);
});

test("removing calanoida from player deck", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[0].deck.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[0].deck.includes(calanoida)).toBe(false);
});

test("removing calanoida from player discard", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[0].discard.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[0].discard.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer cards", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].hand.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].hand.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer hand", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].hand.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].hand.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer deck", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].deck.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].deck.includes(calanoida)).toBe(false);
});

test("removing calanoida from multiplayer discard", async () => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.players[2].discard.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
  });

  const state = getState();
  expect(calanoida).toBeDefined();
  expect(state.players[2].discard.includes(calanoida)).toBe(false);
});
