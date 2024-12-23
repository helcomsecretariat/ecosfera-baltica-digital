import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, find, without } from "lodash";
import { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "habitatRestoration";
export const cardName = "Habitat restoration";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.habitatRestoration.name" as const,
    description: "deck.policies.habitatRestoration.description" as const,
    eventDescription: "deck.policies.habitatRestoration.eventDescription" as const,
  } as Record<string, TranslationKey>,
} as const;

export const actions = {
  [`${cardPrefix}RestoreExtinctionTile`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const extinctionTile = context.extinctMarket.table.slice(-1);
      draft.extinctMarket.table = without(context.extinctMarket.table, ...extinctionTile);
      draft.extinctMarket.deck = concat(context.extinctMarket.deck, extinctionTile);
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
    initial: "restoreExtinctionTile",
    states: {
      restoreExtinctionTile: {
        entry: [`${cardPrefix}RestoreExtinctionTile`],
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
