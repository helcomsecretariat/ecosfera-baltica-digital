import { TurnMachineContext } from "@/state/machines/turn";
import { AnimalCard, Card, GameState, PlantCard, StageEventType } from "@/state/types";
import { produce } from "immer";
import { find, initial, intersection, map } from "lodash-es";
import { Target } from "lucide-react";
import { assign } from "xstate";

const CARD_NAME = "substance_regulation";
const prefix = `${CARD_NAME}_`;
const CARD_TTL = 1;

type State = {
  // plants: PlantCard[];
  // animals: AnimalCard[];
  selectedPlant: PlantCard | undefined;
  selectedAnimal: AnimalCard | undefined;
};

const actions = {
  initState: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const player = find(draft.players, { uid: draft.turn.player })!;
      draft.extPack[CARD_NAME] = {
        plants: player.hand.filter((card) => card.type === "plant") as PlantCard[],
        animals: player.hand.filter((card) => card.type === "animal") as AnimalCard[],
        selectedPlant: undefined,
        selectedAnimal: undefined,
      };
    }),
  ),

  selectCard: assign(({ context }: { context: GameState }, card: Card) =>
    produce(context, (draft) => {
      if (card.type === "plant") {
        draft.extPack[CARD_NAME].selectedPlant = card;
      } else if (card.type === "animal") {
        draft.extPack[CARD_NAME].selectedAnimal = card;
      }
    }),
  ),

  sendToStage: assign(({ context }: { context: GameState }) =>
    produce(context, (draft) => {
      const { selectedPlant, selectedAnimal } = context.extPack[CARD_NAME];
      const cardUIDs = map([selectedPlant!, selectedAnimal!], "uid");
      const sharedHabitats = intersection(selectedPlant?.habitats, selectedAnimal?.habitats);
      const habitats = context.habitatMarket.deck.filter((habitat) => sharedHabitats.includes(habitat.name));

      draft.stage = {
        eventType: "habitatUnlock" as StageEventType,
        cause: cardUIDs,
        effect: map(habitats, "uid"),
      };

      draft.habitatMarket.deck = context.habitatMarket.deck.map((habitatTile) => ({
        ...habitatTile,
        isAcquired: habitatTile.isAcquired || !!find(habitats, { uid: habitatTile.uid }),
      }));

      draft.turn.playedCards.push(...cardUIDs);
    }),
  ),
};

const guards = {
  selectedCardsShareHabitat: ({ context: { extPack } }: { context: GameState }) => {
    const { selectedPlant, selectedAnimal } = extPack[CARD_NAME];
    return intersection(selectedPlant?.habitats, selectedAnimal?.habitats).length > 0;
  },
};

const stateMachine = {
  entry: {
    actions: prefix + "initState",
    target: `selectingCards`,
  },
  states: {
    initial: "selectingCards",
    selectingCards: {
      on: {
        "user.click.player.hand.card": prefix + "selectCard",
      },
    },
  },
};

export { CARD_NAME, CARD_TTL, type State, actions, guards, stateMachine };
