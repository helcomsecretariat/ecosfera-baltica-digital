import { GameState, PlantCard } from "@/state/types";
import { produce } from "immer";
import { assign } from "@/state/machines/assign";
import { ExpansionConditionConfig, ExpansionStateNodeConfig, ToParameterizedObject } from "@/lib/types";
import { TurnMachineGuards } from "../guards";
import { filter, findIndex } from "lodash";
import { TranslationKey } from "@/i18n";
import { and } from "xstate";

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
    name: "deck.policies.improvedNutrientRetention.name" as const,
    description: "deck.policies.improvedNutrientRetention.description" as const,
    eventDescription: "deck.policies.improvedNutrientRetention.eventDescription" as const,
  } as Record<string, TranslationKey>,
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

  [`${cardPrefix}Deactivate`]: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      draft.policyMarket.active = draft.policyMarket.active.filter((c) => c.name !== cardName);
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
    entry: [`${cardPrefix}ReducePlantNutrientRequirement`, `${cardPrefix}Deactivate`],
    always: "#turn",
  },
};

export const conditionCheck: ExpansionConditionConfig<ActionParams, GuardParams> = {
  target: `#turn.${cardPrefix}`,
  guard: and([
    {
      type: "isPolicyCardActive",
      params: cardName,
    },
  ]),
};
