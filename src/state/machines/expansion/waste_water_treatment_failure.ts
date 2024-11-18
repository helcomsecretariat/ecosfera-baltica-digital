import { GameState } from "@/state/types";
import { produce } from "immer";
import { find, map, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";

const cardPrefix = "wasteWaterTreatmentFailure";
const cardName = "Waste water treatment failure";

export const actions = {
  [`${cardPrefix}Action`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.players.forEach((player) => {
        if (map(player.hand, "name").includes("nutrients")) {
          const disasterCard = draft.disasterMarket.deck[0];
          draft.disasterMarket.deck = without(draft.disasterMarket.deck, disasterCard);
          player.hand.push(disasterCard);
        }
      });
    }),
  ),
  [`${cardPrefix}Done`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.activePolicyCards = without(
        context.activePolicyCards,
        find(context.activePolicyCards, { name: cardName })!,
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
    initial: "action",
    states: {
      action: {
        entry: [`${cardPrefix}Action`],
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
