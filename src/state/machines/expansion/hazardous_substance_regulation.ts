import { AnimalCard, GameState, PlantCard } from "@/state/types";
import { produce } from "immer";
import { filter, find, first, intersection, map } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { and } from "xstate";
import i18n, { TranslationKey } from "@/i18n";
import * as Shared from "./shared";

export const cardPrefix = "hazardousSubstanceRegulation";
export const cardName = "Hazardous substance regulation";

export const uiStrings = {
  [cardName]: {
    name: "deck.policies.hazardousSubstanceRegulation.name" as const,
    description: "deck.policies.hazardousSubstanceRegulation.description" as const,
    eventDescription: "deck.policies.hazardousSubstanceRegulation.eventDescription" as const,
    commandBarPickProducer: "deck.policies.hazardousSubstanceRegulation.pickProducerCommandBarText" as const,
    commandBarPickConsumer: "deck.policies.hazardousSubstanceRegulation.pickAnimalCommandBarText" as const,
  } as Record<string, TranslationKey>,
} as const;

const internalContext: { target: PlantCard | null; destination: AnimalCard | null } = {
  target: null,
  destination: null,
};

export const actions = {
  [`${cardPrefix}Init`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.commandBar = {
        text: i18n.t(uiStrings[cardName].commandBarPickProducer),
      };
    }),
  ),
  [`${cardPrefix}SetTarget`]: assign(({ context }: { context: GameState }, card: PlantCard) =>
    produce(context, (draft) => {
      internalContext.target = card;
      draft.commandBar = {
        text: i18n.t(uiStrings[cardName].commandBarPickConsumer),
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
};

export type GuardParams = ToParameterizedObject<typeof TurnMachineGuards>;
export type ActionParams = ToParameterizedObject<typeof actions & typeof Shared.actions>;

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
              ({ context, event }) => TurnMachineGuards.ownsCard({ context }, event.card.uid),
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
              ({ context, event }) => TurnMachineGuards.ownsCard({ context }, event.card.uid),
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
        entry: [`${cardPrefix}Action`, { type: `${Shared.prefix}SetAutomaticPolicyDraw`, params: "habitat" }],
        after: {
          animationDuration: "done",
        },
      },
      done: {
        on: {
          "user.click.stage.confirm": {
            target: "#turn",
            actions: {
              type: `${Shared.prefix}Exhaust`,
              params: ({ context }) => find(context.policyMarket.active, { name: cardName })!,
            },
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
