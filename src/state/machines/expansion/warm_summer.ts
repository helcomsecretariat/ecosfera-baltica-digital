import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { find } from "lodash";
import i18n from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "warmSummer";
export const cardName = "Warm summer";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.warmSummer.name"),
    description: i18n.t("deck.policies.warmSummer.description"),
    eventDescription: i18n.t("deck.policies.warmSummer.eventDescription"),
  },
} as const;

export const actions = {
  [`${cardPrefix}Action`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      // Check if at least one measure has been implemented
      const positiveEffect = context.policyMarket.exhausted.length > 0;

      draft.players.forEach((player) => {
        player.abilities = player.abilities.map((ability) => {
          return { ...ability, isUsed: !positiveEffect };
        });
      });
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
