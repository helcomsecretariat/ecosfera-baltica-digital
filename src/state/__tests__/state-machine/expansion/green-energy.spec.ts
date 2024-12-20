import { expect, test } from "vitest";
import { getTestActor, testRandomSeed } from "@/state/__tests__/utils";
import { find } from "lodash";
import { HabitatName } from "@/state/types";

test.each<{ habitatName: HabitatName }>([{ habitatName: "mud" }, { habitatName: "rock" }, { habitatName: "coast" }])(
  "%s habitat acquired causes extinction",
  async ({ habitatName }) => {
    const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1 });
    const stateBefore = getState();

    const mudHabitat = stateBefore.habitatMarket.deck.find((habitatTile) => habitatTile.name === habitatName)!;
    mudHabitat.isAcquired = true;

    activatePolicy({
      policyName: "Green energy",
      stateBefore,
    });

    send({ type: "user.click.stage.confirm" });

    const state = getState();
    expect(state.commandBar).toBeUndefined();
    expect(stateBefore.extinctMarket.table.length - state.extinctMarket.table.length).toBe(-1);
  },
);

test.each<{ habitatName: HabitatName }>([{ habitatName: "mud" }, { habitatName: "rock" }, { habitatName: "coast" }])(
  "mud and rock and coast habitat not acquired unlocks %s",
  async ({ habitatName }) => {
    const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1 });
    const stateBefore = getState();

    activatePolicy({
      policyName: "Green energy",
      stateBefore,
    });
    send({ type: "user.click.market.deck.habitat", name: habitatName });

    const state = getState();
    expect(state.commandBar).toBeUndefined();
    expect(find(state.habitatMarket.deck, { name: habitatName })?.isAcquired).toBe(true);
  },
);

test.each<{ habitatName: HabitatName }>([{ habitatName: "mud" }, { habitatName: "rock" }, { habitatName: "coast" }])(
  "unlocking %s habitat draws policy card",
  async ({ habitatName }) => {
    const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1 });
    const stateBefore = getState();

    activatePolicy({
      policyName: "Green energy",
      stateBefore,
    });
    send({ type: "user.click.market.deck.habitat", name: habitatName });

    const state = getState();
    expect(state.commandBar).toBeUndefined();
    expect(find(state.habitatMarket.deck, { name: habitatName })?.isAcquired).toBe(true);

    expect(state.stage?.eventType).toMatch(/^policy_policyAutoDraw/);
  },
);

testRandomSeed("allow only mud and rock and coast habitats to be unlocked", async (seed) => {
  const { send, getState, activatePolicy } = getTestActor({ useSpecialCards: true, playerCount: 1, seed });
  const stateBefore = getState();

  activatePolicy({
    policyName: "Green energy",
    stateBefore,
  });
  send({ type: "user.click.market.deck.habitat", name: "rivers" });

  const state = getState();
  expect(state.commandBar).toBeDefined();
  expect(find(state.habitatMarket.deck, { name: "rivers" })?.isAcquired).toBe(false);
});
