import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { find } from "lodash";

testRandomSeed(
  "drawing a positive policy card with funding results in policy_policyDrawPositiveHasFunding stage",
  async (seed) => {
    const { send, getState } = getTestActor({
      useSpecialCards: true,
      seed,
    });
    const stateBefore = getState();

    // Setup special ability card
    const specialCard = find(stateBefore.animalMarket.deck, (card) => card.abilities.includes("special"))!;
    stateBefore.players[0].hand = [specialCard];

    // Setup policy market
    const positiveCard = find(stateBefore.policyMarket.deck, { effect: "positive" })!;
    const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
    stateBefore.policyMarket.deck = [positiveCard];
    stateBefore.policyMarket.funding = [fundingCard];

    send({ type: "iddqd", context: stateBefore });

    // Use special ability
    send({
      type: "user.click.player.hand.card.token",
      card: specialCard,
      abilityName: "special",
    });

    const stateAfter = getState();
    expect(stateAfter.stage?.eventType).toBe("policy_policyDrawPositiveHasFunding");
    expect(stateAfter.stage?.outcome).toBe("positive");
    expect(stateAfter.policyMarket.acquired).toContainEqual(positiveCard);
  },
);

testRandomSeed(
  "drawing a positive policy card without funding results in policy_policyDrawPositiveNoFunding stage",
  async (seed) => {
    const { send, getState } = getTestActor({
      useSpecialCards: true,
      seed,
    });
    const stateBefore = getState();

    // Setup special ability card
    const specialCard = find(stateBefore.animalMarket.deck, (card) => card.abilities.includes("special"))!;
    stateBefore.players[0].hand = [specialCard];

    // Setup policy market
    const positiveCard = find(stateBefore.policyMarket.deck, { effect: "positive" })!;
    stateBefore.policyMarket.deck = [positiveCard];
    stateBefore.policyMarket.funding = [];

    send({ type: "iddqd", context: stateBefore });

    // Use special ability
    send({
      type: "user.click.player.hand.card.token",
      card: specialCard,
      abilityName: "special",
    });

    const stateAfter = getState();
    expect(stateAfter.stage?.eventType).toBe("policy_policyDrawPositiveNoFunding");
    expect(stateAfter.stage?.outcome).toBe("positive");
    expect(stateAfter.policyMarket.acquired).toContainEqual(positiveCard);
  },
);

testRandomSeed("drawing a negative policy card results in policy_policyDrawNegative stage", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Find a negative policy card
  const negativeCard = find(stateBefore.policyMarket.deck, { effect: "negative" })!;

  activatePolicy({
    policyName: negativeCard.name,
    stateBefore,
    specialCardSource: "animals",
    autoConfirmStage: false,
  });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyDrawNegative");
  expect(stateAfter.stage?.outcome).toBe("negative");
  expect(stateAfter.policyMarket.table).toContainEqual(negativeCard);
  expect(stateAfter.policyMarket.active).toContainEqual(negativeCard);
});

testRandomSeed("drawing a dual policy card results in policy_policyDrawDual stage", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Find a dual policy card
  const dualCard = find(stateBefore.policyMarket.deck, { effect: "dual" })!;

  activatePolicy({
    policyName: dualCard.name,
    stateBefore,
    specialCardSource: "animals",
    autoConfirmStage: false,
  });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyDrawDual");
  expect(stateAfter.stage?.outcome).toBe("negative");
  expect(stateAfter.policyMarket.table).toContainEqual(dualCard);
  expect(stateAfter.policyMarket.active).toContainEqual(dualCard);
});

testRandomSeed(
  "drawing an implementation policy card results in policy_policyDrawImplementation stage",
  async (seed) => {
    const { activatePolicy, getState } = getTestActor({
      useSpecialCards: true,
      seed,
    });
    const stateBefore = getState();

    // Find an implementation policy card
    const implementationCard = find(stateBefore.policyMarket.deck, { effect: "implementation" })!;

    activatePolicy({
      policyName: implementationCard.name,
      stateBefore,
      specialCardSource: "animals",
      autoConfirmStage: false,
    });

    const stateAfter = getState();
    expect(stateAfter.stage?.eventType).toBe("policy_policyDrawImplementation");
    expect(stateAfter.stage?.outcome).toBe("positive");
    expect(stateAfter.policyMarket.funding).toContainEqual(implementationCard);
  },
);

testRandomSeed(
  "drawing a positive policy card with habitat unlock and funding results in correct stage",
  async (seed) => {
    const { send, getState } = getTestActor({
      useSpecialCards: true,
      seed,
    });
    const stateBefore = getState();

    // Setup animals for habitat unlock
    const animalCards = stateBefore.animalMarket.deck.filter((card) => card.habitats.includes("coast"))!.slice(0, 2);
    stateBefore.players[0].hand = animalCards;
    stateBefore.turn.playedCards = animalCards.map((card) => card.uid);

    // Setup policy market
    const positiveCard = find(stateBefore.policyMarket.deck, { effect: "positive" })!;
    const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
    stateBefore.policyMarket.deck = [positiveCard];
    stateBefore.policyMarket.funding = [fundingCard];
    stateBefore.turn.automaticPolicyDraw = { cause: "habitat" };

    send({ type: "iddqd", context: stateBefore });
    send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

    const stateAfter = getState();
    expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawHabitatPositiveHasFunding");
    expect(stateAfter.stage?.outcome).toBe("positive");
    expect(stateAfter.policyMarket.acquired).toContainEqual(positiveCard);
  },
);

testRandomSeed(
  "drawing a positive policy card with habitat unlock and no funding results in correct stage",
  async (seed) => {
    const { send, getState } = getTestActor({
      useSpecialCards: true,
      seed,
    });
    const stateBefore = getState();

    // Setup animals for habitat unlock
    const animalCards = stateBefore.animalMarket.deck.filter((card) => card.habitats.includes("coast"))!.slice(0, 2);
    stateBefore.players[0].hand = animalCards;
    stateBefore.turn.playedCards = animalCards.map((card) => card.uid);

    // Setup policy market
    const positiveCard = find(stateBefore.policyMarket.deck, { effect: "positive" })!;
    stateBefore.policyMarket.deck = [positiveCard];
    stateBefore.policyMarket.funding = [];
    stateBefore.turn.automaticPolicyDraw = { cause: "habitat" };

    send({ type: "iddqd", context: stateBefore });
    // trigger checking
    send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

    const stateAfter = getState();
    expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawHabitatPositiveNoFunding");
    expect(stateAfter.stage?.outcome).toBe("positive");
    expect(stateAfter.policyMarket.acquired).toContainEqual(positiveCard);
  },
);

testRandomSeed("drawing a negative policy card with habitat unlock results in correct stage", async (seed) => {
  const { send, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Setup animals for habitat unlock
  const animalCards = stateBefore.animalMarket.deck.filter((card) => card.habitats.includes("coast"))!.slice(0, 2);
  stateBefore.players[0].hand = animalCards;
  stateBefore.turn.playedCards = animalCards.map((card) => card.uid);

  // Setup policy market
  const negativeCard = find(stateBefore.policyMarket.deck, { effect: "negative" })!;
  stateBefore.policyMarket.deck = [negativeCard];
  stateBefore.turn.automaticPolicyDraw = { cause: "habitat" };

  send({ type: "iddqd", context: stateBefore });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawHabitatNegative");
  expect(stateAfter.stage?.outcome).toBe("negative");
  expect(stateAfter.policyMarket.table).toContainEqual(negativeCard);
  expect(stateAfter.policyMarket.active).toContainEqual(negativeCard);
});

testRandomSeed("drawing a dual policy card with habitat unlock results in correct stage", async (seed) => {
  const { send, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Setup animals for habitat unlock
  const animalCards = stateBefore.animalMarket.deck.filter((card) => card.habitats.includes("coast"))!.slice(0, 2);
  stateBefore.players[0].hand = animalCards;
  stateBefore.turn.playedCards = animalCards.map((card) => card.uid);

  // Setup policy market
  const dualCard = find(stateBefore.policyMarket.deck, { effect: "dual" })!;
  stateBefore.policyMarket.deck = [dualCard];
  stateBefore.turn.automaticPolicyDraw = { cause: "habitat" };

  send({ type: "iddqd", context: stateBefore });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawHabitatDual");
  expect(stateAfter.stage?.outcome).toBe("negative");
  expect(stateAfter.policyMarket.table).toContainEqual(dualCard);
  expect(stateAfter.policyMarket.active).toContainEqual(dualCard);
});

testRandomSeed("drawing an implementation policy card with habitat unlock results in correct stage", async (seed) => {
  const { send, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Setup animals for habitat unlock
  const animalCards = stateBefore.animalMarket.deck.filter((card) => card.habitats.includes("coast"))!.slice(0, 2);
  stateBefore.players[0].hand = animalCards;
  stateBefore.turn.playedCards = animalCards.map((card) => card.uid);

  // Setup policy market
  const implementationCard = find(stateBefore.policyMarket.deck, { effect: "implementation" })!;
  stateBefore.policyMarket.deck = [implementationCard];
  stateBefore.turn.automaticPolicyDraw = { cause: "habitat" };

  send({ type: "iddqd", context: stateBefore });
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawHabitatImplementation");
  expect(stateAfter.stage?.outcome).toBe("positive");
  expect(stateAfter.policyMarket.funding).toContainEqual(implementationCard);
});

testRandomSeed("drawing a positive policy card with extinction and funding results in correct stage", async (seed) => {
  const { send, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Setup policy market
  const positiveCard = find(stateBefore.policyMarket.deck, { effect: "positive" })!;
  const fundingCard = find(stateBefore.policyMarket.deck, { name: "Funding" })!;
  stateBefore.policyMarket.deck = [positiveCard];
  stateBefore.policyMarket.funding = [fundingCard];
  stateBefore.turn.automaticPolicyDraw = { cause: "extinction" };

  send({ type: "iddqd", context: stateBefore });
  // trigger checking
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawExtinctionPositiveHasFunding");
  expect(stateAfter.stage?.outcome).toBe("positive");
  expect(stateAfter.policyMarket.acquired).toContainEqual(positiveCard);
});

testRandomSeed(
  "drawing a positive policy card with extinction and no funding results in correct stage",
  async (seed) => {
    const { send, getState } = getTestActor({
      useSpecialCards: true,
      seed,
    });
    const stateBefore = getState();

    // Setup policy market
    const positiveCard = find(stateBefore.policyMarket.deck, { effect: "positive" })!;
    stateBefore.policyMarket.deck = [positiveCard];
    stateBefore.policyMarket.funding = [];
    stateBefore.turn.automaticPolicyDraw = { cause: "extinction" };

    send({ type: "iddqd", context: stateBefore });
    // trigger checking
    send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

    const stateAfter = getState();
    expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawExtinctionPositiveNoFunding");
    expect(stateAfter.stage?.outcome).toBe("positive");
    expect(stateAfter.policyMarket.acquired).toContainEqual(positiveCard);
  },
);

testRandomSeed("drawing a negative policy card with extinction results in correct stage", async (seed) => {
  const { send, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Setup policy market
  const negativeCard = find(stateBefore.policyMarket.deck, { effect: "negative" })!;
  stateBefore.policyMarket.deck = [negativeCard];
  stateBefore.turn.automaticPolicyDraw = { cause: "extinction" };

  send({ type: "iddqd", context: stateBefore });
  // trigger checking
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawExtinctionNegative");
  expect(stateAfter.stage?.outcome).toBe("negative");
  expect(stateAfter.policyMarket.table).toContainEqual(negativeCard);
  expect(stateAfter.policyMarket.active).toContainEqual(negativeCard);
});

testRandomSeed("drawing a dual policy card with extinction results in correct stage", async (seed) => {
  const { send, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Setup policy market
  const dualCard = find(stateBefore.policyMarket.deck, { effect: "dual" })!;
  stateBefore.policyMarket.deck = [dualCard];
  stateBefore.turn.automaticPolicyDraw = { cause: "extinction" };

  send({ type: "iddqd", context: stateBefore });
  // trigger checking
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawExtinctionDual");
  expect(stateAfter.stage?.outcome).toBe("negative");
  expect(stateAfter.policyMarket.table).toContainEqual(dualCard);
  expect(stateAfter.policyMarket.active).toContainEqual(dualCard);
});

testRandomSeed("drawing an implementation policy card with extinction results in correct stage", async (seed) => {
  const { send, getState } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  // Setup policy market
  const implementationCard = find(stateBefore.policyMarket.deck, { effect: "implementation" })!;
  stateBefore.policyMarket.deck = [implementationCard];
  stateBefore.turn.automaticPolicyDraw = { cause: "extinction" };

  send({ type: "iddqd", context: stateBefore });
  // trigger checking
  send({ type: "user.click.player.hand.card", card: stateBefore.players[0].hand[0] });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_policyAutoDrawExtinctionImplementation");
  expect(stateAfter.stage?.outcome).toBe("positive");
  expect(stateAfter.policyMarket.funding).toContainEqual(implementationCard);
});
