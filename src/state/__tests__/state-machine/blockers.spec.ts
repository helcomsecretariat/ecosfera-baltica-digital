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

test("trying to end turn when turns are blocked", async () => {
  const { send, getState } = getTestActor({ playerCount: 4 });
  const stateBefore = getState();
  const nextPlayerAfterSkip = stateBefore.players[2].uid;
  stateBefore.blockers.turn.isBloked = true;
  stateBefore.turn.boughtPlant = true; // avoid punishment

  expect(stateBefore.turn.player).toBe(stateBefore.players[0].uid);

  send({
    type: "iddqd",
    context: stateBefore,
  });

  send({ type: "user.click.player.endTurn" });

  const stateAfter = getState();
  expect(stateAfter.stage?.eventType).toBe("skipTurn");
  expect(stateAfter.stage?.outcome).toBe("negative");

  send({ type: "user.click.stage.confirm" });
  send({ type: "user.click.stage.confirm" });

  const stateAfterConfirm = getState();
  expect(stateAfterConfirm.turn.player).toBe(nextPlayerAfterSkip);
});
