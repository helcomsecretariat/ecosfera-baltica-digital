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
