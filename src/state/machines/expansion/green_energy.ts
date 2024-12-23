import { GameState, HabitatName } from "@/state/types";
import { produce } from "immer";
import { concat, find, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { or } from "xstate";
import i18n, { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "greenEnergy";
export const cardName = "Green energy";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.greenEnergy.name" as const,
    description: "deck.policies.greenEnergy.description" as const,
    eventDescription: "deck.policies.greenEnergy.eventDescription" as const,
    commandBar: "deck.policies.greenEnergy.commandBarText" as const,
  } as Record<string, TranslationKey>,
} as const;

export const actions = {
  [`${cardPrefix}InitCommandBar`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.commandBar = {
        text: i18n.t(uiStrings[cardName].commandBar),
      };
    }),
  ),
  [`${cardPrefix}AddExtinctionTile`]: assign(({ context }: { context: GameState }) =>
    produce(context, ({ extinctMarket }) => {
      const extinctionTile = context.extinctMarket.deck.slice(0, 1);
      extinctMarket.deck = without(context.extinctMarket.deck, ...extinctionTile);
      extinctMarket.table = concat(context.extinctMarket.table, extinctionTile);
    }),
  ),
  [`${cardPrefix}UnlockHabitat`]: assign(({ context }: { context: GameState }, name: HabitatName) =>
    produce(context, (draft) => {
      draft.commandBar = undefined;
      draft.habitatMarket.deck.forEach((habitatTile) => {
        if (habitatTile.name === name) habitatTile.isAcquired = true;
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
    initial: "initial",
    states: {
      initial: {
        always: [
          {
            target: "addingExtinctionTile",
            guard: or([
              ({ context }) => TurnMachineGuards.habitatUnlocked({ context }, "mud"),
              ({ context }) => TurnMachineGuards.habitatUnlocked({ context }, "rock"),
              ({ context }) => TurnMachineGuards.habitatUnlocked({ context }, "coast"),
            ]),
          },
          {
            target: "pickingTarget",
          },
        ],
      },
      addingExtinctionTile: {
        entry: [
          `${cardPrefix}AddExtinctionTile`,
          { type: `${Shared.prefix}SetAutomaticPolicyDraw`, params: "extinction" },
        ],
        always: "#turn",
        exit: {
          type: `${Shared.prefix}Exhaust`,
          params: ({ context }) => find(context.policyMarket.active, { name: cardName })!,
        },
      },
      pickingTarget: {
        entry: [`${cardPrefix}InitCommandBar`, { type: `${Shared.prefix}SetAutomaticPolicyDraw`, params: "habitat" }],
        on: {
          "user.click.market.deck.habitat": {
            target: "#turn",
            actions: {
              type: `${cardPrefix}UnlockHabitat`,
              params: ({ event }) => event.name,
            },
            guard: or([
              ({ event }) => event.name === "rock",
              ({ event }) => event.name === "mud",
              ({ event }) => event.name === "coast",
            ]),
          },
        },
        exit: {
          type: `${Shared.prefix}Exhaust`,
          params: ({ context }) => find(context.policyMarket.active, { name: cardName })!,
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
