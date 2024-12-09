import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "../../utils";
import { find, without } from "lodash";

testRandomSeed("removing calanoida from animal table", async (seed) => {
  const { getState, activatePolicy } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();
  stateBefore.animalMarket.deck = [...stateBefore.animalMarket.deck, ...stateBefore.animalMarket.table];
  stateBefore.animalMarket.table = [];
  const calanoida = find(stateBefore.animalMarket.deck, { name: "Calanoida" })!;
  stateBefore.animalMarket.deck = without(stateBefore.animalMarket.deck, calanoida);
  stateBefore.animalMarket.table = stateBefore.animalMarket.deck.slice(0, 3);
  stateBefore.animalMarket.table.push(calanoida);

  activatePolicy({
    policyName: "Atmospheric deposition of hazardous substances",
    stateBefore,
    specialCardSource: "plants",
  });

  const state = getState();
  expect(state.animalMarket.table.includes(calanoida)).toBe(false);
  expect(state.animalMarket.table).toHaveLength(4);
});

testRandomSeed("removing calanoida from animal deck", async () => {
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

testRandomSeed("removing calanoida from player hand", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
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

testRandomSeed("removing calanoida from player deck", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
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

testRandomSeed("removing calanoida from player discard", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
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

testRandomSeed("removing calanoida from multiplayer cards", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    seed,
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

testRandomSeed("removing calanoida from multiplayer hand", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    seed,
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

testRandomSeed("removing calanoida from multiplayer deck", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    seed,
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

testRandomSeed("removing calanoida from multiplayer discard", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 4,
    seed,
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
