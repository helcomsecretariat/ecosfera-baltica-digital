import { DisasterCard, GameState } from "@/state/types";
import { produce } from "immer";
import { concat, find, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import i18n from "@/i18n";
import { and } from "xstate";
import { shuffle } from "@/state/utils";
import * as Shared from "./shared";

export const cardPrefix = "recyclingAndWasteDisposal";
export const cardName = "Recycling and waste disposal";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.recyclingAndWasteDisposal.name"),
    description: i18n.t("deck.policies.recyclingAndWasteDisposal.description"),
    eventDescription: i18n.t("deck.policies.recyclingAndWasteDisposal.eventDescription"),
  },
};

const internalContext: { target: DisasterCard | null; numberOfCardsTransferred: number } = {
  numberOfCardsTransferred: 0,
  target: null,
};

export const actions = {
  [`${cardPrefix}Init`]: () => {
    internalContext.numberOfCardsTransferred = 0;
  },
  [`${cardPrefix}InitCommandBar`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.commandBar = {
        text: i18n.t("deck.policies.recyclingAndWasteDisposal.commandBarText"),
      };
    }),
  ),
  [`${cardPrefix}SetTarget`]: assign(({ context }: { context: GameState }, card: DisasterCard) =>
    produce(context, (draft) => {
      internalContext.target = card;
      draft.commandBar = undefined;
    }),
  ),
  [`${cardPrefix}RemoveDisasterCard`]: assign(({ context }: { context: GameState }) =>
    produce(context, ({ blockers, players }) => {
      if (internalContext.target === null) return;

      const targetPlayer = players.find((player) =>
        player.hand.some((handCard) => handCard.uid === internalContext.target!.uid),
      );

      if (!targetPlayer) return;

      if (targetPlayer.deck.length === 0) {
        targetPlayer.deck = shuffle(targetPlayer.discard, context.config.seed);
        targetPlayer.discard = [];
      }

      targetPlayer.hand = without(targetPlayer.hand, find(targetPlayer.hand, { uid: internalContext.target.uid })!);
      targetPlayer.hand = concat(targetPlayer.hand, targetPlayer.deck.slice(0, 1));
      targetPlayer.deck = targetPlayer.deck.slice(1);

      internalContext.numberOfCardsTransferred += 1;
      internalContext.target = null;

      // Block policy cancellation to prevent infinite activation
      blockers.policyCancellation.isBlocked = true;
      blockers.policyCancellation.reasons.push(find(context.policyMarket.active, { name: cardName })!.uid);
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
    entry: `${cardPrefix}Init`,
    initial: "initial",
    states: {
      initial: {
        always: [
          {
            target: "pickingTarget",
            guard: and([
              () => internalContext.numberOfCardsTransferred < 2,
              ({ context }) => TurnMachineGuards.playerHasDisasterCardInHand({ context }),
            ]),
          },
          { target: "done" },
        ],
      },
      pickingTarget: {
        entry: `${cardPrefix}InitCommandBar`,
        on: {
          "user.click.player.hand.card": {
            target: "action",
            actions: {
              type: `${cardPrefix}SetTarget`,
              params: ({ event }) => event.card as DisasterCard,
            },
            guard: { type: "isDisasterCard", params: ({ event }) => event.card },
          },
        },
      },
      action: {
        entry: { type: `${cardPrefix}RemoveDisasterCard`, params: () => internalContext.target! },
        after: {
          animationDuration: "initial",
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
