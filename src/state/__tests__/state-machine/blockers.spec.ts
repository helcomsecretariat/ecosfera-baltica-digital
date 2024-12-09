import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { removeOne } from "@/lib/utils";

test("using plus ability when abilities are blocked", async () => {
  const { send, getState } = getTestActor();

  send({
    type: "iddqd",
    context: {
      blockers: {
        ability: {
          isBloked: true,
          reasons: ["policy-8"],
        },
        turn: {
          isBloked: false,
          reasons: [],
        },
      },
    },
  });

  const stateBefore = getState();
  const token = stateBefore.players[0].abilities.find(({ name }) => name === "plus")!;

  send({ type: "user.click.token", token });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("abilityUseBlocked");
  expect(stateAfter.stage?.outcome).toBe("negative");

  send({ type: "user.click.stage.confirm" });

  const stateAfterConfirm = getState();
  expect(stateAfterConfirm.players[0].abilities.find(({ name }) => name === "plus")!.isUsed).toBe(false);
  expect(stateAfterConfirm.stage).toBeUndefined();
});

test("using card ability when abilities are blocked", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();
  const cardWithAbility = removeOne(stateBefore.plantMarket.deck, (card) => card.abilities.includes("plus"))!;
  stateBefore.players[0].hand.push(cardWithAbility);
  stateBefore.blockers.ability.reasons = ["policy-8"];
  stateBefore.blockers.ability.isBloked = true;

  send({
    type: "iddqd",
    context: stateBefore,
  });

  await send({
    type: "user.click.player.hand.card.token",
    card: cardWithAbility,
    abilityName: cardWithAbility.abilities[0],
  });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("abilityUseBlocked");
  expect(stateAfter.stage?.outcome).toBe("negative");

  send({ type: "user.click.stage.confirm" });

  const stateAfterConfirm = getState();
  expect(stateAfterConfirm.players[0].abilities.find(({ name }) => name === "plus")!.isUsed).toBe(false);
  expect(stateAfterConfirm.stage).toBeUndefined();
});
