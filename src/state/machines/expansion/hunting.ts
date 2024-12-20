import { GameState } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { filter, find, without } from "lodash";
import i18n from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "hunting";
export const cardName = "Hunting";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.hunting.name"),
    description: i18n.t("deck.policies.hunting.description"),
    eventDescription: i18n.t("deck.policies.hunting.eventDescription"),
  },
} as const;

export const actions = {
  [`${cardPrefix}RemovePlayerBirdsAndMammals`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const player = find(draft.players, { uid: context.turn.player })!;
      const handBirds = filter(player.hand, { faunaType: "bird" });
      const handMammals = filter(player.hand, { faunaType: "mammal" });
      player.hand = without(player.hand, ...[...handBirds, ...handMammals]);
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
    initial: "removePlayerBirdsAndMammals",
    states: {
      removePlayerBirdsAndMammals: {
        entry: [`${cardPrefix}RemovePlayerBirdsAndMammals`],
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
