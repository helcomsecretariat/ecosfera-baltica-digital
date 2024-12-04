import { GameState, PlantCard } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { filter, find, findIndex, without } from "lodash";
import i18n from "@/i18n";

const removeNutrientsFromPlantCards = (cards: PlantCard[]): PlantCard[] => {
  return cards.map((card) => {
    const nutrientIndex = findIndex(card.elements, (element) => element === "nutrients");
    if (nutrientIndex !== -1) {
      return {
        ...card,
        elements: [...card.elements.slice(0, nutrientIndex), ...card.elements.slice(nutrientIndex + 1)],
      };
    }
    return card;
  });
};

export const cardPrefix = "improvedNutrientRetention";
export const cardName = "Improved nutrient retention in agriculture";

export const uiStrings = {
  [cardName]: {
    name: i18n.t("deck.policies.improvedNutrientRetention.name"),
    description: i18n.t("deck.policies.improvedNutrientRetention.description"),
  },
} as const;

export const actions = {
  [`${cardPrefix}ReducePlantNutrientRequirement`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      // Plants in market deck
      draft.plantMarket.deck = removeNutrientsFromPlantCards(context.plantMarket.deck);

      // Plants in market table
      draft.plantMarket.table = removeNutrientsFromPlantCards(context.plantMarket.table);

      // Plants in player cards
      draft.players = context.players.map((player) => {
        return {
          ...player,
          hand: [
            ...filter(player.hand, (card) => card.type !== "plant"),
            ...removeNutrientsFromPlantCards(filter(player.hand, { type: "plant" }) as PlantCard[]),
          ],
          deck: [
            ...filter(player.deck, (card) => card.type !== "plant"),
            ...removeNutrientsFromPlantCards(filter(player.deck, { type: "plant" }) as PlantCard[]),
          ],
          discard: [
            ...filter(player.discard, (card) => card.type !== "plant"),
            ...removeNutrientsFromPlantCards(filter(player.discard, { type: "plant" }) as PlantCard[]),
          ],
        };
      });
    }),
  ),
  [`${cardPrefix}Done`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
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
    initial: "reducePlantNutrientRequirement",
    states: {
      reducePlantNutrientRequirement: {
        entry: [`${cardPrefix}ReducePlantNutrientRequirement`],
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
