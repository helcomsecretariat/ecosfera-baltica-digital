import { BasePolicyCard, GameState } from "@/state/types";
import { produce } from "immer";
import { ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { TranslationKey } from "@/i18n";
import { assign } from "@/state/machines/assign";
import { first } from "lodash";

export const cardPrefix = "strictProtection";
export const cardName = "Strict protection";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.strictProtection.name" as const,
    description: "deck.policies.strictProtection.description" as const,
    eventDescription: "deck.policies.strictProtection.eventDescription" as const,
    stageEventText: "deck.policies.strictProtection.stageEventText" as const,
    protectionActivationText: "deck.policies.strictProtection.protectionActivationText" as const,
  } as Record<string, TranslationKey>,
} as const;

export type StageEvent = "policy_strictProtection" | "policy_allowProtectionActivation";
export const stageEventTextKeys: Record<StageEvent, TranslationKey> = {
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
        cause: undefined,
        effect: [
          first(context.policyMarket.exhausted.filter((card) => card.name !== "Funding").slice(-1))!.uid,
          (context.policyMarket.active.find((card) => card.name === cardName) as BasePolicyCard)?.uid,
        ],
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
