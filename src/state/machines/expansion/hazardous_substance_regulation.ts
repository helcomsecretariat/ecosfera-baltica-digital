import { AnimalCard, GameState, PlantCard } from "@/state/types";
import { produce } from "immer";
import { filter, find, first, intersection, map, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { and } from "xstate";

const cardPrefix = "hazardousSubstanceRegulation";
const cardName = "Hazardous substance regulation";

const internalContext: { target: PlantCard | null; destination: AnimalCard | null } = {
  target: null,
  destination: null,
};

export const actions = {
  [`${cardPrefix}Init`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.commandBar = {
        text: "Pick a producer card that shares a habitat with an animal card",
      };
    }),
  ),
  [`${cardPrefix}SetTarget`]: assign(({ context }: { context: GameState }, card: PlantCard) =>
    produce(context, (draft) => {
      internalContext.target = card;
      draft.commandBar = {
        text: "Pick an animal card that shares a habitat with your chosen producer card",
      };
    }),
  ),
  [`${cardPrefix}SetDestination`]: assign(({ context }: { context: GameState }, card: AnimalCard) =>
    produce(context, (draft) => {
      internalContext.destination = card;
      draft.commandBar = undefined;
    }),
  ),
  [`${cardPrefix}Action`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      if (internalContext.target === null || internalContext.destination === null) {
        return;
      }

      const relevantHabitatNames = intersection(internalContext.target.habitats, internalContext.destination.habitats);

      const matchingHabitatTile = first(
        filter(
          context.habitatMarket.deck,
          (habitatTile) => habitatTile.isAcquired === false && relevantHabitatNames.includes(habitatTile.name),
        ),
      );

      if (matchingHabitatTile === undefined) {
        return;
      }

      draft.habitatMarket.deck = context.habitatMarket.deck.map((habitatTile) => {
        return {
          ...habitatTile,
          isAcquired: habitatTile.uid === matchingHabitatTile.uid ? true : habitatTile.isAcquired,
        };
      });
      draft.stage = {
        eventType: "habitatUnlock",
        cause: map([internalContext.target, internalContext.destination], "uid"),
        effect: [matchingHabitatTile.uid],
        outcome: "positive",
      };
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
    initial: "pickingTarget",
    states: {
      pickingTarget: {
        entry: `${cardPrefix}Init`,
        on: {
          "user.click.player.hand.card": {
            target: "pickingDestination",
            actions: {
              type: `${cardPrefix}SetTarget`,
              params: ({ event }) => event.card as PlantCard,
            },
            guard: and([
              ({ context, event }) => TurnMachineGuards.isPlantCard({ context }, event.card),
              ({ context, event }) => TurnMachineGuards.hasSharedHabitatInHand({ context }, event.card as PlantCard),
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
              params: ({ event }) => event.card as AnimalCard,
            },
            guard: and([
              ({ context, event }) => TurnMachineGuards.isAnimalCard({ context }, event.card),
              ({ context, event }) =>
                TurnMachineGuards.hasSharedHabitat(
                  { context },
                  { plantCard: internalContext.target!, animalCard: event.card as AnimalCard },
                ),
            ]),
          },
        },
      },
      action: {
        entry: [`${cardPrefix}Action`],
        after: {
          animationDuration: "done",
        },
      },
      done: {
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

export const conditionCheck: ExpansionConditionConfig<ActionParams, GuardParams> = {
  target: `#turn.${cardPrefix}`,
  guard: {
    type: "isPolicyCardActive",
    params: cardName,
  },
};
