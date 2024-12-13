import { BasePolicyCard, GameState } from "@/state/types";
import { produce } from "immer";
import { ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import i18n from "@/i18n";
import { assign } from "@/state/machines/assign";

export const cardPrefix = "strictProtection";
export const cardName = "Strict protection";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.strictProtection.name"),
    description: i18n.t("deck.policies.strictProtection.description"),
    eventDescription: i18n.t("deck.policies.strictProtection.eventDescription"),
    stageEventText: i18n.t("deck.policies.strictProtection.stageEventText"),
    protectionActivationText: i18n.t("deck.policies.strictProtection.protectionActivationText"),
  },
};

export const stageEventText = {
  policy_strictProtection: uiStrings[cardName].stageEventText,
  policy_allowProtectionActivation: uiStrings[cardName].protectionActivationText,
};

export const actions = {
  [`${cardPrefix}Done`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.stage = undefined;
    }),
  ),
  [`${cardPrefix}StageProtection`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.stage = {
        eventType: "policy_strictProtection",
        outcome: "positive",
        cause: [(context.policyMarket.table.find((card) => card.name === cardName) as BasePolicyCard)?.uid],
        effect: undefined,
      };
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
    initial: "stageProtection",
    states: {
      stageProtection: {
        entry: `${cardPrefix}StageProtection`,
        on: {
          "user.click.stage.confirm": {
            target: "#turn",
            actions: [`${cardPrefix}Done`],
          },
        },
      },
    },
  },
};
