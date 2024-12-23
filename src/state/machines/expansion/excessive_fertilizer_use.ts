import { ElementCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, filter, find, without } from "lodash";
import { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "excessiveFertilizerUse";
export const cardName = "Excessive fertiliser use";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.excessiveFertilizerUse.name" as const,
    description: "deck.policies.excessiveFertilizerUse.description" as const,
    eventDescription: "deck.policies.excessiveFertilizerUse.eventDescription" as const,
  } as Record<string, TranslationKey>,
} as const;

export const actions = {
  [`${cardPrefix}DistributeNutrientCards`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const player = find(draft.players, { uid: context.turn.player })!;
      const nutrientCards = filter(context.elementMarket.deck, { name: "nutrients" }).slice(0, 2);

      if (nutrientCards.length < 2) {
        const disasterCard = context.disasterMarket.deck.slice(0, 1);
        player.hand = concat(player.hand, disasterCard);
        draft.disasterMarket.deck = without(context.disasterMarket.deck, ...disasterCard);
        return;
      }

      player.hand = concat(player.hand, nutrientCards);
      draft.elementMarket.deck = without(context.elementMarket.deck, ...nutrientCards);
    }),
  ),
  [`${cardPrefix}RemoveOxygenCards`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.players.forEach((player) => {
        const oxygenCards = filter(player.hand, { name: "oxygen", type: "element" }) as ElementCard[];
        draft.elementMarket.deck = concat(draft.elementMarket.deck, oxygenCards);
        player.hand = without(player.hand, ...oxygenCards);
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
    initial: "distributeNutrientCards",
    states: {
      distributeNutrientCards: {
        entry: [`${cardPrefix}DistributeNutrientCards`],
        after: {
          animationDuration: "removeOxygenCards",
        },
      },
      removeOxygenCards: {
        entry: [`${cardPrefix}RemoveOxygenCards`],
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
