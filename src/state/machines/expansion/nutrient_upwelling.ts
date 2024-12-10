import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { filter, find, without } from "lodash";
import i18n from "@/i18n";

export const cardPrefix = "nutrientUpwelling";
export const cardName = "Nutrient upwelling and internal nutrient cycling";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.nutrientUpwelling.name"),
    description: i18n.t("deck.policies.nutrientUpwelling.description"),
    eventDescription: i18n.t("deck.policies.nutrientUpwelling.eventDescription"),
  },
} as const;

export const actions = {
  [`${cardPrefix}DistributeNutrientCards`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const nutrientCards = filter(context.elementMarket.deck, { name: "nutrients" }).slice(
        0,
        context.players.length * 2,
      );

      let playerIndex = 0;

      nutrientCards.forEach((card) => {
        const currentPlayer = draft.players[playerIndex];
        currentPlayer.hand.push(card);

        playerIndex = (playerIndex + 1) % context.players.length;
      });

      draft.elementMarket.deck = without(context.elementMarket.deck, ...nutrientCards);
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
    initial: "distributeNutrientCards",
    states: {
      distributeNutrientCards: {
        entry: [`${cardPrefix}DistributeNutrientCards`],
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
