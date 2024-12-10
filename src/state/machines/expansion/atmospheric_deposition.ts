import { AnimalCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { concat, find, without } from "lodash";
import i18n from "@/i18n";

export const cardPrefix = "atmosphericDeposition";
export const cardName = "Atmospheric deposition of hazardous substances";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.atmosphericDeposition.name"),
    description: i18n.t("deck.policies.atmosphericDeposition.description"),
    eventDescription: i18n.t("deck.policies.atmosphericDeposition.eventDescription"),
  },
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
    initial: "removeCalanoida",
    states: {
      removeCalanoida: {
        entry: [`${cardPrefix}RemoveCalanoida`],
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
