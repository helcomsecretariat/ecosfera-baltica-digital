import { AnimalCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, filter, find, without } from "lodash";
import { TranslationKey } from "@/i18n";
import * as StrictProtection from "./strict_protection";
import * as Shared from "./shared";

export const cardPrefix = "overfishing";
export const cardName = "Overfishing";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.overfishing.name" as const,
    description: "deck.policies.overfishing.description" as const,
    eventDescription: "deck.policies.overfishing.eventDescription" as const,
  } as Record<string, TranslationKey>,
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
};

export type GuardParams = ToParameterizedObject<typeof TurnMachineGuards>;
export type ActionParams = ToParameterizedObject<typeof actions & typeof Shared.actions>;

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
            target: "activatingProtection",
            guard: "canActivateProtection",
          },
          {
            target: `#turn.${StrictProtection.cardPrefix}.stageProtection`,
            actions: {
              type: `${Shared.prefix}Exhaust`,
              params: ({ context }) => find(context.policyMarket.active, { name: cardName })!,
            },
            guard: { type: "isPolicyCardActive", params: StrictProtection.cardName },
          },
          { target: "discardMarketFish" },
        ],
      },
      activatingProtection: {
        entry: {
          type: `${Shared.prefix}StageProtectionActivation`,
          params: ({ context }) => context.policyMarket.active.find((card) => card.name === cardName)!,
        },
        on: {
          "user.click.stage.confirm": { target: "discardMarketFish", actions: `${Shared.prefix}Unstage` },
          "user.click.policy.card.acquired": {
            target: "checkingProtection",
            actions: {
              type: `${Shared.prefix}UnlockPolicyCard`,
              params: ({ context }) =>
                context.policyMarket.acquired.find((card) => card.name === StrictProtection.cardName)!,
            },
          },
        },
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
