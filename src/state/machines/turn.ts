import { assign, setup, sendTo } from "xstate";
import { AbilityMachineInEvents, AbilityMachineOutEvents, AbilityMachine } from "@/state/machines/ability";
import { AbilityTile, AnimalCard, BiomeTile, Card, ElementCard, GameState, PlantCard } from "@/state/types";
import { DeckConfig } from "@/decks/schema";
import { spawnDeck } from "@/state/deck-spawner";
import { produce } from "immer";
import { compact, countBy, entries, find, intersection, reject, without } from "lodash";
import { replaceItem } from "@/state/utils";
import { BuyMachineGuards } from "@/state/machines/guards/buy";

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
      | { type: "user.click.habitat"; tile: BiomeTile }
      | { type: "iddqd"; context: GameState }
      | AbilityMachineInEvents
      | AbilityMachineOutEvents,
  },
  actions: {
    borrowElement: assign(({ context }: { context: GameState }, name: ElementCard["name"]) =>
      produce(context, (draft) => {
        const card = find(draft.elementMarket.deck, { name });
        if (!card) return;
        draft.turn.borrowedElement = card;
      }),
    ),
    playCard: assign(({ context }: { context: GameState }, uid: Card["uid"]) =>
      produce(context, (draft) => {
        draft.turn.playedCards.push(uid);
      }),
    ),
    unPlayCard: assign(({ context }: { context: GameState }, uid: Card["uid"]) =>
      produce(context, (draft) => {
        draft.turn.playedCards = without(draft.turn.playedCards, uid);
      }),
    ),
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

    buyHabitat: assign(({ context }: { context: GameState }, tile: BiomeTile) =>
      produce(context, (draft) => {
        const { turn, players, biomeMarket } = draft;
        const { playedCards, player } = turn;

        const playedAnimals =
          (find(players, { uid: player })
            ?.hand.filter(({ uid }) => playedCards.includes(uid))
            .filter(({ type }) => type === "animal") as AnimalCard[]) ?? [];

        const toBeExhaustedAnimals = playedAnimals.filter(({ biomes }) => biomes.includes(tile.name)).slice(0, 2);

        // animals do not exhaust cuz playr could buy multiple habitats with same animals
        // exhaustedCards.push(...toBeExhaustedAnimals.map(({ uid }) => uid));
        turn.playedCards = without(turn.playedCards, ...toBeExhaustedAnimals.map(({ uid }) => uid));

        find(biomeMarket.deck, { name: tile.name })!.isAcquired = true;
      }),
    ),

    drawPlayerDeck: assign(({ context }) =>
      produce(context, ({ turn, players }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;
        const drawnCard = player.deck.shift();
        if (drawnCard) player.hand.push(drawnCard);
      }),
    ),
    cardToAnimalDeck: assign(({ context }, card: AnimalCard) =>
      produce(context, ({ players, animalMarket, turn }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;
        player.hand = reject(player.hand, card);
        animalMarket.deck.push(card);
      }),
    ),
    cardToPlantDeck: assign(({ context }, card: PlantCard) =>
      produce(context, ({ players, plantMarket, turn }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;
        player.hand = reject(player.hand, card);
        plantMarket.deck.push(card);
      }),
    ),
    cardToElementDeck: assign(({ context }, card: ElementCard) =>
      produce(context, ({ players, elementMarket, turn }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;
        player.hand = reject(player.hand, card);
        elementMarket.deck.push(card);
      }),
    ),
    refreshAnimalDeck: assign(({ context }) =>
      produce(context, ({ animalMarket }) => {
        let { table, deck } = animalMarket;
        const newDeck = [...deck, ...table];
        const newTable = newDeck.slice(0, 4);
        animalMarket.deck = without(newDeck, ...newTable);
        animalMarket.table = newTable;
      }),
    ),
    refreshPlantDeck: assign(({ context }) =>
      produce(context, ({ plantMarket }) => {
        let { table, deck } = plantMarket;
        const newDeck = [...deck, ...table];
        const newTable = newDeck.slice(0, 4);
        plantMarket.deck = without(newDeck, ...newTable);
        plantMarket.table = newTable;
      }),
    ),

    setContext: assign(({ context }, newContext: GameState) => ({ ...context, ...newContext })),
  },
  guards: {
    ...BuyMachineGuards,
  },
  actors: {
    ability: AbilityMachine,
  },
}).createMachine({
  id: "turn",
  context: ({ input: { config, numberOfPlayers, seed } }) => spawnDeck(config, numberOfPlayers, seed),
  initial: "buying",

  on: {
    iddqd: {
      actions: {
        type: "setContext",
        params: ({ event: { context } }) => context,
      },
    },
  },

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
        "user.click.market.deck.element": {
          actions: { type: "borrowElement", params: ({ event: { name } }) => name },
          guard: "canBorrow",
        },
        "user.click.player.hand.card": [
          {
            actions: {
              type: "playCard",
              params: ({ event: { card } }) => card.uid,
            },
            guard: { type: "notPlayedCard", params: ({ event: { card } }) => card.uid },
          },
          {
            actions: {
              type: "unPlayCard",
              params: ({ event: { card } }) => card.uid,
            },
            guard: {
              type: "notExhausted",
              params: ({ event: { card } }) => card.uid,
            },
          },
        ],
        "user.click.market.table.card": {
          actions: {
            type: "buyCard",
            params: ({ event: { card } }) => card,
          },
          guard: { type: "canBuyCard", params: ({ event: { card } }) => card },
        },
        "user.click.habitat": {
          actions: {
            type: "buyHabitat",
            params: ({ event: { tile } }) => tile,
          },
          guard: { type: "canBuyHabitat", params: ({ event: { tile } }) => tile },
        },
      },
    },

    ability: {
      on: {
        "user.click.*": {
          actions: sendTo("ability", ({ event }) => event),
        },
        "ability.draw.playerDeck": {
          actions: "drawPlayerDeck",
        },
        "ability.move.toAnimalDeck": {
          actions: {
            type: "cardToAnimalDeck",
            params: ({ event: { card } }) => card,
          },
        },
        "ability.move.toPlantDeck": {
          actions: {
            type: "cardToPlantDeck",
            params: ({ event: { card } }) => card,
          },
        },
        "ability.move.toElementDeck": {
          actions: {
            type: "cardToElementDeck",
            params: ({ event: { card } }) => card,
          },
        },
        "ability.refresh.animalDeck": {
          actions: "refreshAnimalDeck",
        },
        "ability.refresh.plantDeck": {
          actions: "refreshPlantDeck",
        },
      },

      invoke: {
        id: "ability",
        src: "ability",
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
