import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { filter, map, without } from "lodash";
import { TranslationKey } from "@/i18n";

export const cardPrefix = "climateChange";
export const cardName = "Climate change";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.climateChange.name" as const,
    description: "deck.policies.climateChange.description" as const,
    eventDescription: "deck.policies.climateChange.eventDescription" as const,
    stageEventText: "deck.policies.climateChange.stageEventText" as const,
  } as Record<string, TranslationKey>,
} as const;

export type StageEvent = "policy_climateChange";
export const stageEventTextKeys: Record<StageEvent, TranslationKey> = {
  policy_climateChange: "deck.policies.climateChange.stageEventText",
};

export const actions = {
  [`${cardPrefix}Action`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const extinctionTile = context.extinctMarket.deck[0];

      if (extinctionTile === undefined) return;

      draft.extinctMarket.deck = without(context.extinctMarket.deck, extinctionTile);
      draft.extinctMarket.table.push(extinctionTile);

      draft.stage = {
        eventType: "policy_climateChange",
        cause: map(filter(context.policyMarket.active, { name: cardName }), "uid"),
        effect: [extinctionTile.uid],
        outcome: "negative",
      };
    }),
  ),
  [`${cardPrefix}Done`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.stage = undefined;
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
        on: {
          "user.click.stage.confirm": {
            target: "#turn.endingTurn",
            actions: [`${cardPrefix}Done`],
          },
        },
      },
    },
  },
};
