import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, filter, find, without } from "lodash";

const cardPrefix = "hazardousIndustrialSubstances";
const cardName = "Hazardous substances from industry";

export const actions = {
  [`${cardPrefix}DiscardMarketPlants`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.plantMarket.deck = concat(context.plantMarket.deck, context.plantMarket.table);

      const replacementCards = context.plantMarket.deck.slice(0, 4);
      draft.plantMarket.table = replacementCards;
      draft.plantMarket.deck = without(draft.plantMarket.deck, ...replacementCards);
    }),
  ),
  [`${cardPrefix}DiscardPlayerPlants`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.players.forEach((player) => {
        const playerPlants = filter(player.hand, { type: "plant" });
        player.hand = without(player.hand, ...playerPlants);
        player.discard = concat(player.discard, playerPlants);
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
    initial: "discardMarketPlants",
    states: {
      discardMarketPlants: {
        entry: [`${cardPrefix}DiscardMarketPlants`],
        after: {
          animationDuration: "discardPlayerPlants",
        },
      },
      discardPlayerPlants: {
        entry: [`${cardPrefix}DiscardPlayerPlants`],
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
