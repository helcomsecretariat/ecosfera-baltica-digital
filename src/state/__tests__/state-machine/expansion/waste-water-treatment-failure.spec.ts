import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { expect } from "vitest";

testRandomSeed("no disaster card assigned when players have 0 nutrients", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
    seed,
  });
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => {
    const playerDeck = [...player.deck, ...player.hand].filter(
      (card) => card.type !== "disaster" && card.name !== "nutrients",
    );

    return {
      ...player,
      deck: playerDeck,
      hand: playerDeck.slice(0, 4),
    };
  });

  activatePolicy({ policyName: "Waste water treatment failure", stateBefore });

  const stateAfter = getState();
  expect(
    stateAfter.players.every((player) => player.hand.filter((card) => card.type === "disaster").length === 0),
  ).toBe(true);
});

testRandomSeed("disaster card assigned when players have nutrients", async (seed) => {
  const { activatePolicy, getState } = getTestActor({
    useSpecialCards: true,
    playerCount: 1,
    seed,
  });
  const stateBefore = getState();

  stateBefore.players = stateBefore.players.map((player) => {
    const playerDeck = [...player.deck, ...player.hand].filter((card) => card.type !== "disaster");

    return {
      ...player,
      deck: playerDeck,
      hand: [
        ...playerDeck.filter((card) => card.name === "nutrients").slice(0, 1),
        ...playerDeck.filter((card) => card.name !== "nutrients").slice(0, 3),
      ],
    };
  });

  activatePolicy({ policyName: "Waste water treatment failure", stateBefore });

  const stateAfter = getState();
  expect(
    stateAfter.players.every((player) => player.hand.filter((card) => card.type === "disaster").length === 1),
  ).toBe(true);
});
