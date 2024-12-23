import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { find } from "lodash";
import { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "bubbleCurtains";
export const cardName = "Bubble curtains";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.bubbleCurtains.name" as const,
    description: "deck.policies.bubbleCurtains.description" as const,
    eventDescription: "deck.policies.bubbleCurtains.eventDescription" as const,
  } as Record<string, TranslationKey>,
} as const;

export const actions = {
  [`${cardPrefix}RestorePlayerAbilities`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.players.forEach((player) => {
        player.abilities.forEach((ability) => {
          ability.isUsed = false;
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
    initial: "restorePlayerAbilities",
    states: {
      restorePlayerAbilities: {
        entry: [`${cardPrefix}RestorePlayerAbilities`],
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
