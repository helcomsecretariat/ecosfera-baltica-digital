import { GameState, HabitatName } from "@/state/types";
import { produce } from "immer";
import { concat, find, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { or } from "xstate";
import i18n from "@/i18n";

export const cardPrefix = "greenEnergy";
export const cardName = "Green energy";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.greenEnergy.name"),
    description: i18n.t("deck.policies.greenEnergy.description"),
    eventDescription: i18n.t("deck.policies.greenEnergy.eventDescription"),
  },
};

export const actions = {
  [`${cardPrefix}InitCommandBar`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.commandBar = {
        text: i18n.t("deck.policies.greenEnergy.commandBarText"),
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
  [`${cardPrefix}Done`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.stage = undefined;
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
        entry: `${cardPrefix}AddExtinctionTile`,
        always: "done",
      },
      pickingTarget: {
        entry: `${cardPrefix}InitCommandBar`,
        on: {
          "user.click.market.deck.habitat": {
            target: "done",
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