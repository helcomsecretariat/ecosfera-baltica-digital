import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { filter, map, without } from "lodash";
import i18n from "@/i18n";

export const cardPrefix = "climateChange";
export const cardName = "Climate change";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.climateChange.name"),
    description: i18n.t("deck.policies.climateChange.description"),
    stageEventText: i18n.t("deck.policies.climateChange.stageEventText"),
  },
} as const;

export const stageEventText = {
  policy_climateChange: uiStrings[cardName].stageEventText,
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
            target: "#turn.endingTurn.discardingRow",
            actions: [`${cardPrefix}Done`],
          },
        },
      },
    },
  },
};
