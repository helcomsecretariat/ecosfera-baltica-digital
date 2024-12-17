import { AnimalCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, filter, find, without } from "lodash";
import i18n from "@/i18n";
import * as StrictProtection from "./strict_protection";
import * as Shared from "./shared";

export const cardPrefix = "oilSpill";
export const cardName = "Oil spill";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.oilSpill.name"),
    description: i18n.t("deck.policies.oilSpill.description"),
    eventDescription: i18n.t("deck.policies.oilSpill.eventDescription"),
  },
} as const;

export const actions = {
  [`${cardPrefix}DiscardMarketBirds`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const marketBirds = filter(context.animalMarket.table, { faunaType: "bird" });
      draft.animalMarket.table = without(context.animalMarket.table, ...marketBirds);
      draft.animalMarket.deck = concat(context.animalMarket.deck, marketBirds);

      const replacementAnimals = context.animalMarket.deck.slice(0, marketBirds.length);
      draft.animalMarket.deck = without(draft.animalMarket.deck, ...replacementAnimals);
      draft.animalMarket.table = concat(draft.animalMarket.table, replacementAnimals);
    }),
  ),
  [`${cardPrefix}DiscardPlayerBirds`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.players.forEach((player) => {
        const playerBirds = filter(filter(player.hand, { type: "animal" }) as AnimalCard[], { faunaType: "bird" });
        player.hand = without(player.hand, ...playerBirds);
        player.discard = concat(player.discard, playerBirds);
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
          { target: "discardMarketBirds" },
        ],
      },
      activatingProtection: {
        entry: {
          type: `${Shared.prefix}StageProtectionActivation`,
          params: ({ context }) => context.policyMarket.active.find((card) => card.name === cardName)!,
        },
        on: {
          "user.click.stage.confirm": { target: "discardMarketBirds", actions: `${Shared.prefix}Unstage` },
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
      discardMarketBirds: {
        entry: [`${cardPrefix}DiscardMarketBirds`],
        after: {
          animationDuration: "discardPlayerBirds",
        },
      },
      discardPlayerBirds: {
        entry: [`${cardPrefix}DiscardPlayerBirds`],
        after: {
          animationDuration: "done",
        },
      },
      done: {
        entry: {
          type: `${Shared.prefix}Exhaust`,
          params: ({ context }) => find(context.policyMarket.active, { name: cardName })!,
        },
        always: "#turn",
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
