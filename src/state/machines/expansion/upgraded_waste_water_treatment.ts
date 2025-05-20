import { ElementCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { filter, find, without } from "lodash";
import { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "upgradedWasteWaterTreatment";
export const cardName = "Upgraded waste water treatment";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.upgradedWasteWaterTreatment.name" as const,
    description: "deck.policies.upgradedWasteWaterTreatment.description" as const,
    eventDescription: "deck.policies.upgradedWasteWaterTreatment.eventDescription" as const,
  } as Record<string, TranslationKey>,
} as const;

export const actions = {
  [`${cardPrefix}DistributeNutrientCards`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const player = find(draft.players, { uid: context.turn.player })!;
      const playerNutrients = filter(player.hand, { name: "nutrients" }) as ElementCard[];

      if (playerNutrients.length >= 3) {
        draft.elementMarket.deck.push(playerNutrients[0]);
        player.hand = without(player.hand, playerNutrients[0]);
        return;
      }

      const marketNutrient = find(context.elementMarket.deck, { name: "nutrients" });
      if (marketNutrient) {
        player.hand.push(marketNutrient);
        draft.elementMarket.deck = without(context.elementMarket.deck, marketNutrient);
      }
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
