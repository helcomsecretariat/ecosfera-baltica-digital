import { AnimalCard, Card, GameState } from "@/state/types";
import { produce } from "immer";
import { concat, find, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { or } from "xstate";
import i18n from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "migratoryBarrierRemoval";
export const cardName = "Migratory barrier removal";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.migratoryBarrierRemoval.name"),
    description: i18n.t("deck.policies.migratoryBarrierRemoval.description"),
    eventDescription: i18n.t("deck.policies.migratoryBarrierRemoval.eventDescription"),
  },
};

const internalContext: { target: AnimalCard | null; destination: Card | null } = {
  target: null,
  destination: null,
};

export const actions = {
  [`${cardPrefix}Init`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.commandBar = {
        text: i18n.t("deck.policies.migratoryBarrierRemoval.pickSpeciesCommandBarText"),
      };
    }),
  ),
  [`${cardPrefix}SetTarget`]: assign(({ context }: { context: GameState }, card: AnimalCard) =>
    produce(context, (draft) => {
      internalContext.target = card;
      draft.commandBar = {
        text: i18n.t("deck.policies.migratoryBarrierRemoval.pickPlayerCommandBarText"),
      };
    }),
  ),
  [`${cardPrefix}SetDestination`]: assign(({ context }: { context: GameState }, card: Card) =>
    produce(context, (draft) => {
      internalContext.destination = card;
      draft.commandBar = undefined;
    }),
  ),
  [`${cardPrefix}CardToPlayerHand`]: assign(({ context }: { context: GameState }, card: Card) =>
    produce(context, ({ animalMarket, players }) => {
      const targetPlayer = players.find((player) => player.hand.some((handCard) => handCard.uid === card.uid));

      if (!targetPlayer || internalContext.target === null) return;

      animalMarket.table = without(context.animalMarket.table, internalContext.target);
      animalMarket.table = concat(animalMarket.table, context.animalMarket.deck[0]);
      animalMarket.deck = without(context.animalMarket.deck, context.animalMarket.deck[0]);
      targetPlayer.hand.push(internalContext.target);
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
    initial: "pickingTarget",
    states: {
      pickingTarget: {
        entry: `${cardPrefix}Init`,
        on: {
          "user.click.market.table.card": {
            target: "pickingDestination",
            actions: {
              type: `${cardPrefix}SetTarget`,
              params: ({ event }) => event.card as AnimalCard,
            },
            guard: or([
              ({ context, event }) => TurnMachineGuards.isBirdCard({ context }, event.card),
              ({ context, event }) => TurnMachineGuards.isFishCard({ context }, event.card),
            ]),
          },
        },
      },
      pickingDestination: {
        on: {
          "user.click.player.hand.card": {
            target: "action",
            actions: {
              type: `${cardPrefix}SetDestination`,
              params: ({ event }) => event.card,
            },
          },
        },
      },
      action: {
        entry: { type: `${cardPrefix}CardToPlayerHand`, params: () => internalContext.destination! },
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
