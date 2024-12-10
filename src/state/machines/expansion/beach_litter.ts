import { BasePolicyCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { find } from "lodash-es";
import i18n from "@/i18n";
import { and, or } from "xstate";

export const cardPrefix = "beachLitter";
export const cardName = "Beach litter" as const;

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.beachLitter.name"),
    description: i18n.t("deck.policies.beachLitter.description"),
  },
} as const;

export interface CardType extends BasePolicyCard {
  name: typeof cardName;
  state?: {
    delayTurns: number;
    activeTurns: number;
  };
}

export const actions = {
  [`${cardPrefix}Initialize`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const card = find(draft.policyMarket.active, { name: cardName })! as CardType;
      if (!card.state) {
        card.state = {
          delayTurns: 1,
          activeTurns: 1,
        };
      }
    }),
  ),

  [`${cardPrefix}LitterTheDeck`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const card = find(draft.policyMarket.active, { name: cardName })! as CardType;
      const activePlayer = find(draft.players, { uid: draft.turn.player })!;
      const cardCopy = { ...card };

      // we now have two on the screen. So we make it different from the original card so rendering won't freak out
      cardCopy.uid += "_litter";

      activePlayer.hand.push(cardCopy);
    }),
  ),

  [`${cardPrefix}ActivateBlocking`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const card = find(context.policyMarket.active, { name: cardName })!;
      const alreadyBlocked = context.blockers.turn.reasons.includes(card.uid);

      if (!alreadyBlocked) {
        draft.blockers.turn.isBlocked = true;
        draft.blockers.turn.reasons.push(card.uid);
      }
    }),
  ),

  [`${cardPrefix}DeactivateMaybe`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      if (!TurnMachineGuards.isPolicyCardActive({ context }, cardName)) return;

      const card = find(draft.policyMarket.active, { name: cardName })! as CardType;

      if (card?.state) {
        if (card.state.delayTurns > 0) {
          card.state.delayTurns--;
        } else if (card.state.activeTurns > 0) {
          card.state.activeTurns--;
        }
      }

      if (card.state?.activeTurns === 0) {
        card.state = undefined;
        draft.blockers.turn.reasons = draft.blockers.turn.reasons.filter((reason) => reason !== card.uid);
        draft.blockers.turn.isBlocked = draft.blockers.turn.reasons.length > 0;

        draft.policyMarket.table = draft.policyMarket.table.filter(({ uid }) => uid !== card.uid);
        draft.policyMarket.active = draft.policyMarket.active.filter(({ uid }) => uid !== card.uid);
      }
    }),
  ),
};

const shouldInitialize = ({ context }: { context: GameState }) => {
  const card = find(context.policyMarket.active, { name: cardName })! as CardType;
  return !card.state;
};

const shouldActivateBlocking = ({ context }: { context: GameState }) => {
  const card = find(context.policyMarket.active, { name: cardName })! as CardType;
  const alreadyBlocked = context.blockers.turn.reasons.includes(card.uid);
  return card.state?.delayTurns === 0 && card.state?.activeTurns > 0 && !alreadyBlocked;
};

export type GuardParams = ToParameterizedObject<typeof TurnMachineGuards>;
export type ActionParams = ToParameterizedObject<typeof actions>;

export const state: {
  [cardPrefix]: ExpansionStateNodeConfig<ActionParams, GuardParams>;
} = {
  [cardPrefix]: {
    tags: ["policy", cardPrefix],
    always: [
      {
        actions: [`${cardPrefix}Initialize`, `${cardPrefix}LitterTheDeck`],
        guard: shouldInitialize,
        target: "#turn",
      },
      {
        actions: [`${cardPrefix}ActivateBlocking`],
        guard: shouldActivateBlocking,
        target: "#turn",
      },
      { target: "#turn" },
    ],
  },
};

export const conditionCheck: ExpansionConditionConfig<ActionParams, GuardParams> = {
  target: `#turn.${cardPrefix}`,
  guard: and([
    {
      type: "isPolicyCardActive",
      params: cardName,
    },
    or([shouldInitialize, shouldActivateBlocking]),
  ]),
};

export const endTurnActions: (keyof typeof actions)[] = [`${cardPrefix}DeactivateMaybe`];
