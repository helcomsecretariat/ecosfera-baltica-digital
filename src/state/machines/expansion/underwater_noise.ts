import { BasePolicyCard, GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { find } from "lodash-es";
import i18n from "@/i18n";
import { and, or } from "xstate";

export const cardPrefix = "underwaterNoise";
export const cardName = "Underwater noise" as const;

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.underwaterNoise.name"),
    description: i18n.t("deck.policies.underwaterNoise.description"),
    eventDescription: i18n.t("deck.policies.underwaterNoise.eventDescription"),
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

  [`${cardPrefix}ActivateBlocking`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const card = find(context.policyMarket.active, { name: cardName })!;
      const alreadyBlocked = context.blockers.ability.reasons.includes(card.uid);

      if (!alreadyBlocked) {
        draft.blockers.ability.isBlocked = true;
        draft.blockers.ability.reasons.push(card.uid);
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
        draft.blockers.ability.reasons = draft.blockers.ability.reasons.filter((reason) => reason !== card.uid);
        draft.blockers.ability.isBlocked = draft.blockers.ability.reasons.length > 0;
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
  const alreadyBlocked = context.blockers.ability.reasons.includes(card.uid);
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
        actions: [`${cardPrefix}Initialize`],
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
