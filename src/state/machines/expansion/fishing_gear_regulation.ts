import { Card, GameState } from "@/state/types";
import { produce } from "immer";
import { concat, filter, find, without } from "lodash";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import i18n from "@/i18n";

export const cardPrefix = "fishingGearRegulation";
export const cardName = "Fishing gear regulation";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.fishingGearRegulation.name"),
    description: i18n.t("deck.policies.fishingGearRegulation.description"),
    eventDescription: i18n.t("deck.policies.fishingGearRegulation.eventDescription"),
  },
};

const internalContext: { destination: Card | null } = {
  destination: null,
};

export const actions = {
  [`${cardPrefix}Init`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.commandBar = {
        text: i18n.t("deck.policies.fishingGearRegulation.commandBarText"),
      };
    }),
  ),
  [`${cardPrefix}SetDestination`]: assign(({ context }: { context: GameState }, card: Card) =>
    produce(context, (draft) => {
      internalContext.destination = card;
      draft.commandBar = undefined;
    }),
  ),
  [`${cardPrefix}CardsToPlayerHand`]: assign(({ context }: { context: GameState }, card: Card) =>
    produce(context, ({ animalMarket, plantMarket, players }) => {
      const targetPlayer = players.find((player) => player.hand.some((handCard) => handCard.uid === card.uid));

      if (!targetPlayer) return;

      const mudAnimals = filter(context.animalMarket.table, (card) =>
        card.habitats.some((habitatTile) => habitatTile === "mud"),
      );
      const mudPlants = filter(context.plantMarket.table, (card) =>
        card.habitats.some((habitatTile) => habitatTile === "mud"),
      );

      animalMarket.table = without(context.animalMarket.table, ...mudAnimals);
      const replacementAnimals = context.animalMarket.deck.slice(0, mudAnimals.length);
      animalMarket.table = concat(animalMarket.table, replacementAnimals);
      animalMarket.deck = without(context.animalMarket.deck, ...replacementAnimals);

      plantMarket.table = without(context.plantMarket.table, ...mudPlants);
      const replacementPlants = context.plantMarket.deck.slice(0, mudPlants.length);
      plantMarket.table = concat(plantMarket.table, replacementPlants);
      plantMarket.deck = without(context.plantMarket.deck, ...replacementPlants);

      targetPlayer.hand = concat(targetPlayer.hand, [...mudAnimals, ...mudPlants]);
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
    initial: "pickingDestination",
    states: {
      pickingDestination: {
        entry: `${cardPrefix}Init`,
        on: {
          "user.click.player.hand.card": {
            target: "action",
            actions: {
              type: `${cardPrefix}SetDestination`,
              params: ({ event }) => event.card,
            },
          },
        },
      },
      action: {
        entry: { type: `${cardPrefix}CardsToPlayerHand`, params: () => internalContext.destination! },
        after: {
          animationDuration: "done",
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