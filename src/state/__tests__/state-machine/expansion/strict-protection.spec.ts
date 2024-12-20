import { expect } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { filter } from "lodash";
import { removeOne } from "@/lib/utils";

testRandomSeed("strict protection prevents oil spill", async (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  const marketDeckBird = removeOne(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.table = [
    ...filter(stateBefore.animalMarket.deck, (card) => card.faunaType !== "bird").slice(0, 3),
    marketDeckBird,
  ];
  const strictProtectionCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Strict protection")!;
  stateBefore.policyMarket.active.push(strictProtectionCard);

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
    specialCardSource: "plants",
  });

  let stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_strictProtection");
  send({ type: "user.click.stage.confirm" });

  stateAfter = getState();
  expect(stateAfter.animalMarket.deck).not.toContain(marketDeckBird);
  expect(stateAfter.animalMarket.table).toContain(marketDeckBird);
});

testRandomSeed("strict protection prevents hazardous industrial substances", async (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();
  const tablePlantsBefore = stateBefore.plantMarket.table;

  const strictProtectionCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Strict protection")!;
  stateBefore.policyMarket.active.push(strictProtectionCard);

  activatePolicy({
    policyName: "Hazardous substances from industry",
    stateBefore,
  });

  let stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_strictProtection");
  send({ type: "user.click.stage.confirm" });

  stateAfter = getState();
  expect(stateAfter.plantMarket.table.every((plantCard) => tablePlantsBefore.includes(plantCard)));
});

testRandomSeed("strict protection prevents overfishing", async (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  const marketDeckFish = removeOne(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "fish",
  ).slice(0, 3);
  stateBefore.animalMarket.table.push(marketDeckFish);

  const strictProtectionCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Strict protection")!;
  stateBefore.policyMarket.active.push(strictProtectionCard);

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
  });

  let stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_strictProtection");
  send({ type: "user.click.stage.confirm" });

  stateAfter = getState();
  expect(stateAfter.animalMarket.table.every((animalCard) => stateBefore.animalMarket.table.includes(animalCard)));
});

testRandomSeed("protection activation allowed before oil spill", async (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  const marketDeckBird = removeOne(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.table = [
    ...filter(stateBefore.animalMarket.deck, (card) => card.faunaType !== "bird").slice(0, 3),
    marketDeckBird,
  ];
  const strictProtectionCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Strict protection")!;
  const fundingCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Funding")!;
  stateBefore.policyMarket.acquired.push(strictProtectionCard);
  stateBefore.policyMarket.funding.push(fundingCard);

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
    specialCardSource: "plants",
  });

  let stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_allowProtectionActivation");
  send({
    type: "user.click.policy.card.acquired",
    card: strictProtectionCard,
  });

  stateAfter = getState();
  expect(stateAfter.animalMarket.deck).not.toContain(marketDeckBird);
  expect(stateAfter.animalMarket.table).toContain(marketDeckBird);
});

testRandomSeed("protection activation allowed before hazardous industrial substances", async (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();
  const tablePlantsBefore = stateBefore.plantMarket.table;

  const strictProtectionCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Strict protection")!;
  const fundingCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Funding")!;
  stateBefore.policyMarket.acquired.push(strictProtectionCard);
  stateBefore.policyMarket.funding.push(fundingCard);

  activatePolicy({
    policyName: "Hazardous substances from industry",
    stateBefore,
    specialCardSource: "plants",
  });

  let stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_allowProtectionActivation");
  send({
    type: "user.click.policy.card.acquired",
    card: strictProtectionCard,
  });

  stateAfter = getState();
  expect(stateAfter.plantMarket.table.every((plantCard) => tablePlantsBefore.includes(plantCard)));
});

testRandomSeed("protection activation allowed before overfishing", async (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  const marketDeckFish = removeOne(stateBefore.animalMarket.deck, { faunaType: "fish" })!;
  stateBefore.animalMarket.table = filter(
    stateBefore.animalMarket.deck,
    (animalDeckCard) => animalDeckCard.faunaType !== "fish",
  ).slice(0, 3);
  stateBefore.animalMarket.table.push(marketDeckFish);

  const strictProtectionCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Strict protection")!;
  const fundingCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Funding")!;
  stateBefore.policyMarket.acquired.push(strictProtectionCard);
  stateBefore.policyMarket.funding.push(fundingCard);

  activatePolicy({
    policyName: "Overfishing",
    stateBefore,
    specialCardSource: "plants",
  });

  let stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_allowProtectionActivation");
  send({
    type: "user.click.policy.card.acquired",
    card: strictProtectionCard,
  });

  stateAfter = getState();
  expect(stateAfter.animalMarket.table.every((animalCard) => stateBefore.animalMarket.table.includes(animalCard)));
});

testRandomSeed("declining protection activation", async (seed) => {
  const { activatePolicy, getState, send } = getTestActor({
    useSpecialCards: true,
    seed,
  });
  const stateBefore = getState();

  const marketDeckBird = removeOne(stateBefore.animalMarket.deck, { faunaType: "bird" })!;
  stateBefore.animalMarket.table = [
    ...filter(stateBefore.animalMarket.deck, (card) => card.faunaType !== "bird").slice(0, 3),
    marketDeckBird,
  ];
  const strictProtectionCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Strict protection")!;
  const fundingCard = removeOne(stateBefore.policyMarket.deck, (card) => card.name === "Funding")!;
  stateBefore.policyMarket.acquired.push(strictProtectionCard);
  stateBefore.policyMarket.funding.push(fundingCard);

  activatePolicy({
    policyName: "Oil spill",
    stateBefore,
    specialCardSource: "plants",
  });

  let stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("policy_allowProtectionActivation");
  send({
    type: "user.click.stage.confirm",
  });

  stateAfter = getState();
  expect(stateAfter.animalMarket.deck).toContain(marketDeckBird);
  expect(stateAfter.animalMarket.table).not.toContain(marketDeckBird);
});
