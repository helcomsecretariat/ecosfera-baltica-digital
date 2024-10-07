import { assign, setup, sendTo } from "xstate";
import { BuyMachine, BuyMachineInEvents, BuyMachineOutEvents } from "@/state/machines/buy";
import { AbilityMachineInEvents, AbilityMachineOutEvents, AbilityMachine } from "@/state/machines/ability";
import { AbilityTile, AnimalCard, ElementCard, GameState, PlantCard } from "@/state/types";
import { DeckConfig } from "@/decks/schema";
import { spawnDeck } from "@/state/deck-spawner";
import { produce } from "immer";
import { compact, countBy, entries, find, intersection, reject, without } from "lodash";
import { replaceItem } from "@/state/utils";

export const TurnMachine = setup({
  types: {
    context: {} as GameState,
    input: {} as {
      config: DeckConfig;
      numberOfPlayers: number;
      seed: string;
    },
    events: {} as
      | { type: "user.click.token"; token: AbilityTile }
      | { type: "user.click.player.hand.card"; card: PlantCard | AnimalCard | ElementCard }
      | { type: "user.click.market.deck.element"; name: ElementCard["name"] }
      | { type: "user.click.market.table.card"; card: PlantCard | AnimalCard }
      | AbilityMachineInEvents
      | AbilityMachineOutEvents
      | BuyMachineOutEvents
      | BuyMachineInEvents,
  },
  actions: {
    buyCard: assign(({ context }: { context: GameState }, card: PlantCard | AnimalCard) =>
      produce(context, (draft) => {
        const { turn } = draft;
        const player = find(draft.players, { uid: turn.player })!;

        if (card.type === "plant") {
          const elementsCounted = countBy(card.elements);
          const toBeExhaustedElementsUIDs = entries(elementsCounted).flatMap(([elementName, count]) =>
            compact([...player.hand, turn.borrowedElement])
              .filter(({ uid }) => turn.playedCards.includes(uid) || turn.borrowedElement?.uid === uid)
              .filter(({ name }) => name === elementName)
              .slice(0, count)
              .map(({ uid }) => uid),
          );

          draft.turn.exhaustedCards.push(...toBeExhaustedElementsUIDs);

          if (turn.borrowedElement && draft.turn.exhaustedCards.includes(turn.borrowedElement?.uid)) {
            draft.elementMarket.deck = without(draft.elementMarket.deck, turn.borrowedElement);
            player.hand.push({ ...turn.borrowedElement });
            turn.borrowedCount++;
            turn.borrowedElement = undefined;
          }

          const drawnCard = draft.plantMarket.deck.shift()!;
          draft.plantMarket.table = replaceItem(card, drawnCard, draft.plantMarket.table);
        }

        if (card.type === "animal") {
          const requiredBiomes = card.biomes;
          const playedPlants =
            (
              player.hand
                .filter(({ uid }) => turn.playedCards.includes(uid))
                .filter(({ type }) => type === "plant") as PlantCard[]
            ).sort((a, b) => a.biomes.length - b.biomes.length) ?? [];
          const toBeExhaustedPlants = playedPlants
            .filter(({ biomes }) => intersection(biomes, requiredBiomes).length > 0)
            .slice(0, 2);

          draft.turn.exhaustedCards.push(...toBeExhaustedPlants.map(({ uid }) => uid));
          const drawnCard = draft.animalMarket.deck.shift()!;
          draft.animalMarket.table = replaceItem(card, drawnCard, draft.animalMarket.table);
        }

        draft.turn.playedCards = without(draft.turn.playedCards, ...draft.turn.exhaustedCards);
        player.hand.push(card);
      }),
    ),
  },
  actors: {
    ability: AbilityMachine,
    buy: BuyMachine,
  },
}).createMachine({
  id: "turn",
  context: ({ input: { config, numberOfPlayers, seed } }) => spawnDeck(config, numberOfPlayers, seed),
  initial: "buying",

  states: {
    buying: {
      on: {
        "user.click.token": {
          target: "#turn.ability",
          actions: assign({
            turn: ({ context: { turn }, event: { token } }) => ({
              ...turn,
              currentAbility: { piece: token, name: token.name },
            }),
          }),
        },
        "user.click.*": {
          actions: sendTo("buy", ({ event }) => event),
        },
        "buy.card": {
          reenter: true,
          target: "buying",
          actions: {
            type: "buyCard",
            params: ({ event: { card } }) => card,
          },
        },
        "buy.iddqd": {
          actions: assign({ turn: ({ event: { context } }) => context.turn }),
        },
      },
      invoke: {
        id: "buy",
        src: "buy",
        input: ({ context }) => ({ context }),
      },
    },

    ability: {
      on: {
        "user.click.*": {
          actions: sendTo("ability", ({ event }) => event),
        },
        "ability.draw.playerDeck": {
          actions: assign(({ context }) =>
            produce(context, ({ turn, players }) => {
              const player = players.find(({ uid }) => uid === turn.player)!;
              const drawnCard = player.deck.shift();
              if (drawnCard) player.hand.push(drawnCard);
            }),
          ),
        },
        "ability.move.toAnimalDeck": {
          actions: assign(({ context, event: { card } }) =>
            produce(context, ({ players, animalMarket, turn }) => {
              const player = players.find(({ uid }) => uid === turn.player)!;
              player.hand = reject(player.hand, card);
              animalMarket.deck.push(card);
            }),
          ),
        },
        "ability.move.toPlantDeck": {
          actions: assign(({ context, event: { card } }) =>
            produce(context, ({ players, plantMarket, turn }) => {
              const player = players.find(({ uid }) => uid === turn.player)!;
              player.hand = reject(player.hand, card);
              plantMarket.deck.push(card);
            }),
          ),
        },
        "ability.move.toElementDeck": {
          actions: assign(({ context, event: { card } }) =>
            produce(context, ({ players, elementMarket, turn }) => {
              const player = players.find(({ uid }) => uid === turn.player)!;
              player.hand = reject(player.hand, card);
              elementMarket.deck.push(card);
            }),
          ),
        },
        "ability.refresh.animalDeck": {
          actions: assign(({ context }) =>
            produce(context, ({ animalMarket }) => {
              let { table, deck } = animalMarket;
              const newDeck = [...deck, ...table];
              const newTable = newDeck.slice(0, 4);
              deck = without(newDeck, ...newTable);
              table = newTable;
            }),
          ),
        },
        "ability.refresh.plantDeck": {
          actions: assign(({ context }) =>
            produce(context, ({ plantMarket }) => {
              let { table, deck } = plantMarket;
              const newDeck = [...deck, ...table];
              const newTable = newDeck.slice(0, 4);
              deck = without(newDeck, ...newTable);
              table = newTable;
            }),
          ),
        },
      },

      invoke: {
        id: "ability",
        src: "ability",
        // @ts-expect-error really strange TS error =(
        input: ({
          context: {
            turn: { currentAbility },
          },
          self,
        }) => ({
          parentActor: self,
          ...currentAbility!,
        }),

        onDone: {
          reenter: true,
          target: "buying",
        },
        onError: {
          reenter: true,
          target: "buying",
        },
      },
    },
  },
});
