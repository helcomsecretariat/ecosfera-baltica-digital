import { AnimalCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, find, without } from "lodash";
import { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "atmosphericDeposition";
export const cardName = "Atmospheric deposition of hazardous substances";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.atmosphericDeposition.name" as const,
    description: "deck.policies.atmosphericDeposition.description" as const,
    eventDescription: "deck.policies.atmosphericDeposition.eventDescription" as const,
  } as Record<string, TranslationKey>,
} as const;

export const actions = {
  [`${cardPrefix}RemoveCalanoida`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      // Calanoida in animal table
      if (find(context.animalMarket.table, { name: "Calanoida" })) {
        draft.animalMarket.table = without(
          context.animalMarket.table,
          find(context.animalMarket.table, { name: "Calanoida" }) ?? ({} as AnimalCard),
        );
        const replacementAnimal = context.animalMarket.deck.slice(0, 1);
        draft.animalMarket.deck = without(context.animalMarket.deck, ...replacementAnimal);
        draft.animalMarket.table = concat(draft.animalMarket.table, replacementAnimal);
        return;
      }

      // Calanoida in animal deck
      draft.animalMarket.deck = without(
        context.animalMarket.deck,
        find(context.animalMarket.deck, { name: "Calanoida" }) ?? ({} as AnimalCard),
      );

      // Calanoida in player cards
      draft.players.forEach((player) => {
        player.hand = without(player.hand, find(player.hand, { name: "Calanoida" }) ?? ({} as AnimalCard));
        player.deck = without(player.deck, find(player.deck, { name: "Calanoida" }) ?? ({} as AnimalCard));
        player.discard = without(player.discard, find(player.discard, { name: "Calanoida" }) ?? ({} as AnimalCard));
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
    initial: "removeCalanoida",
    states: {
      removeCalanoida: {
        entry: [`${cardPrefix}RemoveCalanoida`],
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
