import { AnimalCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, filter, find, without } from "lodash";
import i18n from "@/i18n";
import * as StrictProtection from "./strict_protection";

export const cardPrefix = "overfishing";
export const cardName = "Overfishing";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.overfishing.name"),
    description: i18n.t("deck.policies.overfishing.description"),
    eventDescription: i18n.t("deck.policies.overfishing.eventDescription"),
  },
} as const;

export const actions = {
  [`${cardPrefix}DiscardMarketFish`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const marketFish = filter(context.animalMarket.table, { faunaType: "fish" });
      draft.animalMarket.table = without(context.animalMarket.table, ...marketFish);
      draft.animalMarket.deck = concat(context.animalMarket.deck, marketFish);

      const replacementAnimals = context.animalMarket.deck.slice(0, marketFish.length);
      draft.animalMarket.deck = without(draft.animalMarket.deck, ...replacementAnimals);
      draft.animalMarket.table = concat(draft.animalMarket.table, replacementAnimals);
    }),
  ),
  [`${cardPrefix}DiscardPlayerFish`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.players.forEach((player) => {
        const playerFish = filter(filter(player.hand, { type: "animal" }) as AnimalCard[], { faunaType: "fish" });
        player.hand = without(player.hand, ...playerFish);
        player.discard = concat(player.discard, playerFish);
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
export type ActionParams = ToParameterizedObject<typeof actions>;

export const state: {
  [cardPrefix]: ExpansionStateNodeConfig<ActionParams, GuardParams>;
} = {
  [cardPrefix]: {
    tags: ["policy", cardPrefix],
    initial: "checkingProtection",
    states: {
      checkingProtection: {
        always: [
          {
            target: `#turn.${StrictProtection.cardPrefix}.stageProtection`,
            actions: `${cardPrefix}Done`,
            guard: { type: "isPolicyCardActive", params: StrictProtection.cardName },
          },
          { target: "discardMarketFish" },
        ],
      },
      discardMarketFish: {
        entry: [`${cardPrefix}DiscardMarketFish`],
        after: {
          animationDuration: "discardPlayerFish",
        },
      },
      discardPlayerFish: {
        entry: [`${cardPrefix}DiscardPlayerFish`],
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
