import { AnimalCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, filter, find, without } from "lodash";

const cardPrefix = "oilSpill";
const cardName = "Oil spill";

export const actions = {
  [`${cardPrefix}DiscardMarketBirds`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const marketBirds = filter(context.animalMarket.table, { faunaType: "bird" });
      draft.animalMarket.table = without(context.animalMarket.table, ...marketBirds);
      draft.animalMarket.deck = concat(context.animalMarket.deck, marketBirds);
      console.log(marketBirds);

      const replacementAnimals = context.animalMarket.deck.slice(0, marketBirds.length);
      console.log(replacementAnimals);
      draft.animalMarket.deck = without(draft.animalMarket.deck, ...replacementAnimals);
      draft.animalMarket.table = concat(draft.animalMarket.table, replacementAnimals);
    }),
  ),
  [`${cardPrefix}DiscardPlayerBirds`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.players.forEach((player) => {
        const playerBirds = filter(filter(player.hand, { type: "animal" }) as AnimalCard[], { faunaType: "bird" });
        player.hand = without(player.hand, ...playerBirds);
        player.discard = concat(player.discard, playerBirds);
      });
    }),
  ),
  [`${cardPrefix}Done`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.policyMarket.active = without(
        context.policyMarket.active,
        find(context.policyMarket.active, { name: cardName })!,
      );
      draft.policyMarket.table = without(
        context.policyMarket.table,
        find(context.policyMarket.table, { name: cardName })!,
      );
    }),
  ),
};

export type GuardParams = ToParameterizedObject<typeof TurnMachineGuards>;
export type ActionParams = ToParameterizedObject<typeof actions>;

export const state: {
  [cardPrefix]: ExpansionStateNodeConfig<ActionParams, GuardParams>;
} = {
  [cardPrefix]: {
    tags: ["policy", cardPrefix],
    initial: "discardMarketBirds",
    states: {
      discardMarketBirds: {
        entry: [`${cardPrefix}DiscardMarketBirds`],
        after: {
          animationDuration: "discardPlayerBirds",
        },
      },
      discardPlayerBirds: {
        entry: [`${cardPrefix}DiscardPlayerBirds`],
        after: {
          animationDuration: "done",
        },
      },
      done: {
        entry: [`${cardPrefix}Done`],
        always: {
          target: "#turn",
        },
      },
    },
  },
};

export const conditionCheck: ExpansionConditionConfig<ActionParams, GuardParams> = {
  target: `#turn.${cardPrefix}`,
  guard: {
    type: "isPolicyCardActive",
    params: cardName,
  },
};
