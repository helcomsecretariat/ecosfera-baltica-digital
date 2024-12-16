import { assign } from "@/state/machines/assign";
import { GameState, PolicyCard } from "@/state/types";
import { produce } from "immer";
import * as StrictProtection from "./strict_protection";
import { concat, without } from "lodash";

export const prefix = "expansionShared";

export const actions = {
  [`${prefix}StageProtectionActivation`]: assign(({ context }: { context: GameState }, targetCard: PolicyCard) =>
    produce(context, (draft) => {
      const strictProtectionCard = context.policyMarket.acquired.find(
        (card) => card.name === StrictProtection.cardName,
      );

      if (!strictProtectionCard) return;

      draft.stage = {
        eventType: "policy_allowProtectionActivation",
        cause: undefined,
        effect: [targetCard.uid, strictProtectionCard.uid],
        outcome: "positive",
      };
    }),
  ),

  [`${prefix}UnlockPolicyCard`]: assign(({ context }: { context: GameState }, card: PolicyCard) =>
    produce(context, (draft) => {
      draft.policyMarket.acquired = without(context.policyMarket.acquired, card);
      draft.policyMarket.table.push(card);
      const fundingCard = context.policyMarket.funding.slice(0, 1);
      draft.policyMarket.funding = without(context.policyMarket.funding, ...fundingCard);
      draft.policyMarket.exhausted = concat(context.policyMarket.exhausted, fundingCard);
      draft.policyMarket.active.push(card);
    }),
  ),

  [`${prefix}Unstage`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.stage = undefined;
    }),
  ),
};
