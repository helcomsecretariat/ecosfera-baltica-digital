import { GameState } from "@/state/types";
import { produce } from "immer";
import { find, map, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "wasteWaterTreatmentFailure";
export const cardName = "Waste water treatment failure";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.wasteWaterTreatmentFailure.name" as const,
    description: "deck.policies.wasteWaterTreatmentFailure.description" as const,
    eventDescription: "deck.policies.wasteWaterTreatmentFailure.eventDescription" as const,
  } as Record<string, TranslationKey>,
} as const;

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
export type ActionParams = ToParameterizedObject<typeof actions & typeof Shared.actions>;

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
        entry: {
          type: `${Shared.prefix}Exhaust`,
          params: ({ context }) => find(context.policyMarket.active, { name: cardName })!,
        },
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
