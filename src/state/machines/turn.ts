import { assign, setup, and, not } from "xstate";
import {
  AbilityName,
  AbilityTile,
  AbilityUID,
  AnimalCard,
  HabitatTile,
  Card,
  ElementCard,
  GameConfig,
  GameState,
  PlantCard,
} from "@/state/types";
import { DeckConfig } from "@/decks/schema";
import { spawnDeck } from "@/state/deck-spawner";
import { produce } from "immer";
import { TurnMachineGuards } from "@/state/machines/guards";
import { compact, concat, countBy, entries, find, flatten, intersection, map, reject, without } from "lodash";
import { replaceItem, shuffle } from "@/state/utils";
import { getAnimalHabitatPairs, getDuplicateElements, getSharedHabitats } from "./helpers/turn";

export const TurnMachine = setup({
  types: {
    context: {} as GameState,
    input: {} as {
      deckConfig: DeckConfig;
      gameConfig: GameConfig;
    },
    events: {} as
      | { type: "user.click.player.endTurn" }
      | { type: "user.click.token"; token: AbilityTile }
      | { type: "user.click.cardToken"; name: AbilityName }
      | { type: "user.click.player.hand.card"; card: Card }
      | { type: "user.click.market.deck.element"; name: ElementCard["name"] }
      | { type: "user.click.market.borrowed.card.element"; card: ElementCard }
      | { type: "user.click.market.table.card"; card: PlantCard | AnimalCard }
      | { type: "iddqd"; context: GameState }
      | { type: "user.click.player.hand.card.ability"; card: PlantCard | AnimalCard }
      | { type: "user.click.stage.confirm" }
      | { type: "ability.cancel" }
      | { type: "ability.markAsUsed" }
      | { type: "ability.draw.playerDeck" }
      | { type: "ability.refresh.animalDeck" }
      | { type: "ability.refresh.plantDeck" }
      | { type: "ability.move.toPlayer"; card: Card; destinationCard: Card }
      | { type: "ability.move.toAnimalDeck"; card: AnimalCard }
      | { type: "ability.move.toPlantDeck"; card: PlantCard }
      | { type: "ability.move.toElementDeck"; card: ElementCard; name: ElementCard["name"] }
      | { type: "user.click.market.deck.animal" }
      | { type: "user.click.market.deck.plant" }
      | { type: "user.click.player.hand.card.ability"; card: PlantCard | AnimalCard }
      | { type: "user.click.player.deck" }
      | { type: "internal.target.selected"; target: Card }
      | { type: "user.click.token"; token: AbilityTile },
  },
  actions: {
    borrowElement: assign(({ context }: { context: GameState }, name: ElementCard["name"]) =>
      produce(context, (draft) => {
        const card = find(draft.elementMarket.deck, { name });
        if (!card) return;
        draft.elementMarket.deck = without(draft.elementMarket.deck, card);
        if (draft.turn.borrowedElement) {
          draft.elementMarket.deck = [...draft.elementMarket.deck, draft.turn.borrowedElement];
        }
        draft.turn.borrowedElement = card;
      }),
    ),
    unBorrowElement: assign(({ context }: { context: GameState }, card: ElementCard) =>
      produce(context, (draft) => {
        draft.elementMarket.deck = [...draft.elementMarket.deck, card];
        draft.turn.borrowedElement = undefined;
      }),
    ),
    playCard: assign(({ context }: { context: GameState }, uid: Card["uid"]) =>
      produce(context, (draft) => {
        draft.turn.playedCards = [...draft.turn.playedCards, uid];
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
          draft.turn.boughtPlant = true;
        }

        if (card.type === "animal") {
          const requiredHabitats = card.habitats;
          const playedPlants =
            (
              player.hand
                .filter(({ uid }) => turn.playedCards.includes(uid))
                .filter(({ type }) => type === "plant") as PlantCard[]
            ).sort((a, b) => a.habitats.length - b.habitats.length) ?? [];
          const toBeExhaustedPlants = playedPlants
            .filter(({ habitats }) => intersection(habitats, requiredHabitats).length > 0)
            .slice(0, 2);

          draft.turn.exhaustedCards.push(...toBeExhaustedPlants.map(({ uid }) => uid));
          const drawnCard = draft.animalMarket.deck.shift()!;
          draft.animalMarket.table = replaceItem(card, drawnCard, draft.animalMarket.table);
          draft.turn.boughtAnimal = true;
        }

        draft.turn.playedCards = without(draft.turn.playedCards, ...draft.turn.exhaustedCards);
        player.hand.push(card);
      }),
    ),
    buyHabitat: assign(({ context }: { context: GameState }, tile: HabitatTile) =>
      produce(context, (draft) => {
        const { turn, players, habitatMarket } = draft;
        const { playedCards, player } = turn;

        const playedAnimals =
          (find(players, { uid: player })
            ?.hand.filter(({ uid }) => playedCards.includes(uid))
            .filter(({ type }) => type === "animal") as AnimalCard[]) ?? [];

        const toBeExhaustedAnimals = playedAnimals.filter(({ habitats }) => habitats.includes(tile.name)).slice(0, 2);

        turn.playedCards = without(turn.playedCards, ...toBeExhaustedAnimals.map(({ uid }) => uid));
        turn.unlockedHabitat = true;

        find(habitatMarket.deck, { name: tile.name })!.isAcquired = true;
      }),
    ),
    drawPlayerDeck: assign(({ context }) =>
      produce(context, ({ turn, players }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;
        const drawnCard = player.deck.shift();
        if (drawnCard) player.hand.push(drawnCard);
      }),
    ),
    cardToAnimalDeck: assign(({ context }) =>
      produce(context, ({ players, animalMarket, turn }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;
        player.hand = reject(player.hand, turn.currentAbility?.targetCard);
        if (turn.currentAbility?.targetCard !== undefined) {
          animalMarket.deck.push(turn.currentAbility.targetCard as AnimalCard);
        }
      }),
    ),
    cardToPlantDeck: assign(({ context }) =>
      produce(context, ({ players, plantMarket, turn }) => {
        console.log("dsijfslajdf;lsjdfl");
        const player = players.find(({ uid }) => uid === turn.player)!;
        player.hand = reject(player.hand, turn.currentAbility?.targetCard);
        if (turn.currentAbility?.targetCard !== undefined) {
          plantMarket.deck.push(turn.currentAbility.targetCard as PlantCard);
        }
      }),
    ),
    cardToPlayerHand: assign(({ context }, card: Card) =>
      produce(context, ({ players }) => {
        const player = find(players, { uid: context.turn.player })!;
        const targetPlayer = players.find((player) => player.hand.some((handCard) => handCard.uid === card.uid));

        if (!targetPlayer || context.turn.currentAbility?.targetCard === undefined) return;

        player.hand = reject(player.hand, context.turn.currentAbility.targetCard);
        targetPlayer.hand.push(context.turn.currentAbility.targetCard);
      }),
    ),
    cardToElementDeck: assign(({ context }) =>
      produce(context, ({ players, elementMarket, turn }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;
        player.hand = reject(player.hand, turn.currentAbility?.targetCard);
        if (turn.currentAbility?.targetCard !== undefined) {
          elementMarket.deck.push(turn.currentAbility.targetCard as ElementCard);
        }
      }),
    ),
    refreshAnimalDeck: assign(({ context }) =>
      produce(context, ({ animalMarket }) => {
        const { table, deck } = animalMarket;
        const newDeck = [...deck, ...table];
        const newTable = newDeck.slice(0, 4);
        animalMarket.deck = without(newDeck, ...newTable);
        animalMarket.table = newTable;
      }),
    ),
    refreshPlantDeck: assign(({ context }) =>
      produce(context, ({ plantMarket }) => {
        const { table, deck } = plantMarket;
        const newDeck = [...deck, ...table];
        const newTable = newDeck.slice(0, 4);
        plantMarket.deck = without(newDeck, ...newTable);
        plantMarket.table = newTable;
      }),
    ),
    markAbilityAsUsed: assign(({ context }) =>
      produce(context, ({ players, turn }) => {
        const player = find(players, { uid: context.turn.player })!;

        if (!context.turn.currentAbility) return;

        const ability = find(player.abilities, { uid: context.turn.currentAbility?.piece.uid });
        if (ability) {
          ability.isUsed = true;
        }
        turn.usedAbilities.push({
          source: context.turn.currentAbility.piece.uid,
          name: context.turn.currentAbility.name,
        });
        turn.currentAbility = undefined;
        turn.selectedAbilityCard = undefined;
      }),
    ),
    markAbilityCardAsSelected: assign(({ context }, card: PlantCard | AnimalCard) =>
      produce(context, ({ turn }) => {
        turn.selectedAbilityCard = card;
      }),
    ),
    cancelAbilitySelection: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.turn.currentAbility = undefined;
        draft.turn.selectedAbilityCard = undefined;
      }),
    ),
    discardCards: assign(({ context }: { context: GameState }) =>
      produce(context, ({ players }) => {
        const player = find(players, { uid: context.turn.player })!;
        player.discard = [...player.hand, ...player.discard];
        player.hand = [];
      }),
    ),
    stageNoActionDisaster: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = find(draft.players, { uid: draft.turn.player });
        const disasterCard = context.disasterMarket.deck[0];

        // TODO: Figure out what to do when disaster deck is empty
        if (!disasterCard || !player) return;

        draft.disasterMarket.deck = without(context.disasterMarket.deck, disasterCard);
        player.hand = concat(player.hand, disasterCard);

        draft.stage = {
          eventType: "disaster",
          cause: undefined,
          effect: [disasterCard.uid],
        };
      }),
    ),
    stageDuplicateElementsDisaster: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = find(draft.players, { uid: draft.turn.player });
        const disasterCard = context.disasterMarket.deck[0];

        // TODO: Figure out what to do when disaster deck is empty
        if (!disasterCard || !player) return;

        draft.disasterMarket.deck = without(context.disasterMarket.deck, disasterCard);
        player.hand = concat(player.hand, disasterCard);

        const duplicateElements = getDuplicateElements(context, 3);
        const duplicateElementCards = player.hand
          .filter((cards) => cards.name === duplicateElements[0])
          .slice(0, 3) as ElementCard[];

        draft.stage = {
          eventType: "elementalDisaster",
          cause: map(duplicateElementCards, "uid"),
          effect: [disasterCard.uid],
        };
      }),
    ),
    stageHabitatUnlock: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = find(draft.players, { uid: draft.turn.player })!;

        const playedAnimals =
          (player.hand
            .filter(({ uid }) => context.turn.playedCards.includes(uid))
            .filter(({ type }) => type === "animal") as AnimalCard[]) ?? [];

        const animalHabitatPairs = getAnimalHabitatPairs(playedAnimals);
        const sharedHabitats = context.habitatMarket.deck.filter(
          (marketHabitat) => !marketHabitat.isAcquired && getSharedHabitats(playedAnimals).includes(marketHabitat.name),
        );

        if (animalHabitatPairs.length === 0) return;

        draft.habitatMarket.deck = context.habitatMarket.deck.map((habitatTile) => {
          return {
            ...habitatTile,
            isAcquired:
              habitatTile.isAcquired || sharedHabitats.some((sharedHabitat) => sharedHabitat.name === habitatTile.name),
          };
        });
        draft.turn.unlockedHabitat = true;
        draft.turn.playedCards = without(context.turn.playedCards, ...map(playedAnimals, "uid"));

        draft.stage = {
          eventType: "habitatUnlock",
          cause: map(flatten(animalHabitatPairs), "uid"),
          effect: map(sharedHabitats, "uid"),
        };
      }),
    ),
    stageAbilityRefresh: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = find(draft.players, { uid: draft.turn.player })!;

        const stagedAnimals = player.hand.filter(
          (card) => card.type === "animal" && context.stage?.cause?.includes(card.uid),
        ) as AnimalCard[];

        const availableAnimalHabitatPairs = getAnimalHabitatPairs([
          ...player.hand.filter((card) => card.type === "animal"),
          ...stagedAnimals,
        ]).filter(
          (animalHabitatPair) =>
            !context.turn.uidsUsedForAbilityRefresh.some((uid) =>
              animalHabitatPair.map((animal) => animal.uid).includes(uid),
            ),
        );

        if (availableAnimalHabitatPairs.length === 0) return;

        draft.stage = {
          eventType: "abilityRefresh",
          cause: map(availableAnimalHabitatPairs[0], "uid"),
          effect: undefined,
        };
      }),
    ),
    stageExtinction: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = find(draft.players, { uid: draft.turn.player })!;
        const disasterCards = player?.hand.filter((card) => card.type === "disaster");
        const extinctionTile = context.extinctMarket.deck[0];

        // TODO: Figure out what to do when extinction deck is empty
        if (!extinctionTile) return;

        draft.extinctMarket.deck = without(context.extinctMarket.deck, extinctionTile);
        draft.extinctMarket.table.push(extinctionTile);

        draft.stage = {
          eventType: "extinction",
          cause: map(disasterCards, "uid"),
          effect: [extinctionTile.uid],
        };
      }),
    ),
    stageMassExtinction: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = find(draft.players, { uid: draft.turn.player })!;
        const disasterCards = player?.hand.filter((card) => card.type === "disaster");
        const extinctionTiles = context.extinctMarket.deck.slice(0, 3);

        // TODO: Figure out what to do when extinction deck is empty
        if (extinctionTiles.length === 0) return;

        draft.extinctMarket.deck = without(context.extinctMarket.deck, ...extinctionTiles);
        draft.extinctMarket.table = concat(context.extinctMarket.table, extinctionTiles);

        draft.stage = {
          eventType: "massExtinction",
          cause: map(disasterCards, "uid"),
          effect: map(extinctionTiles, "uid"),
        };
      }),
    ),
    unstage: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.stage = undefined;
      }),
    ),
    drawCards: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const currentPlayerIndex = context.players.findIndex((player) => player.uid === context.turn.player);
        const player = draft.players[currentPlayerIndex];
        player.hand = player.deck.slice(0, 4);
        player.deck = player.deck.slice(player.hand.length);

        if (player.hand.length < 4) {
          player.deck = shuffle(player.discard, context.config.seed);
          player.discard = [];

          const remainingDraw = 4 - player.hand.length;
          player.hand = concat(player.hand, player.deck.slice(0, remainingDraw));
          player.deck = player.deck.slice(remainingDraw);
        }
        draft.turn.phase = "draw";
      }),
    ),
    endTurn: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const currentPlayerIndex = context.players.findIndex((player) => player.uid === context.turn.player);
        const nextPlayerIndex = (currentPlayerIndex + 1) % context.players.length;

        if (draft.turn.borrowedElement) {
          draft.elementMarket.deck = [...draft.elementMarket.deck, draft.turn.borrowedElement];
        }

        draft.turn = {
          player: context.players[nextPlayerIndex].uid,
          currentAbility: undefined,
          exhaustedCards: [],
          playedCards: [],
          borrowedElement: undefined,
          borrowedCount: 0,
          borrowedLimit: context.turn.borrowedLimit,
          usedAbilities: [],
          boughtAnimal: false,
          boughtPlant: false,
          unlockedHabitat: false,
          uidsUsedForAbilityRefresh: [],
          selectedAbilityCard: undefined,
          automaticEventChecks: [],
          phase: "action",
        };
      }),
    ),
    refreshAbility: assign(({ context }: { context: GameState }, abilityUid: AbilityUID) =>
      produce(context, ({ players, turn }) => {
        const player = find(players, { uid: context.turn.player })!;
        const ability = find(player.abilities, { uid: abilityUid });
        if (!ability) return;

        const stagedAnimals = player.hand.filter(
          (card) => card.type === "animal" && context.stage?.cause?.includes(card.uid),
        ) as AnimalCard[];

        const availableAnimalHabitatPairs = getAnimalHabitatPairs([
          ...player.hand.filter((card) => card.type === "animal"),
          ...stagedAnimals,
        ]).filter(
          (animalHabitatPair) =>
            !turn.uidsUsedForAbilityRefresh.some((uid) => animalHabitatPair.map((animal) => animal.uid).includes(uid)),
        );

        if (availableAnimalHabitatPairs.length === 0) return;

        turn.uidsUsedForAbilityRefresh = concat(
          turn.uidsUsedForAbilityRefresh,
          map(availableAnimalHabitatPairs[0], "uid"),
        );
        ability.isUsed = false;
      }),
    ),
    markCheckAsDone: assign(({ context }: { context: GameState }, checkName: string) =>
      produce(context, ({ turn }) => {
        if (turn.automaticEventChecks === undefined) turn.automaticEventChecks = [];
        turn.automaticEventChecks?.push(checkName);
      }),
    ),
    setEndOfTurnPhase: assign(({ context }: { context: GameState }) =>
      produce(context, ({ turn }) => {
        turn.phase = "end";
      }),
    ),
    setAbilityTargetCard: assign(({ context }: { context: GameState }, card: Card) =>
      produce(context, ({ turn }) => {
        if (turn.currentAbility === undefined) return;

        turn.currentAbility.targetCard = card;
      }),
    ),

    setContext: assign(({ context }, newContext: GameState) => ({ ...context, ...newContext })),
  },
  guards: {
    ...TurnMachineGuards,
  },
}).createMachine({
  id: "turn",
  context: ({ input: { deckConfig, gameConfig } }) => spawnDeck(deckConfig, gameConfig),
  initial: "checkingEventConditions",

  on: {
    iddqd: {
      actions: {
        type: "setContext",
        params: ({ event: { context } }) => context,
      },
    },
  },

  states: {
    endingTurn: {
      entry: "setEndOfTurnPhase",
      initial: "checkingEndHand",
      states: {
        checkingEndHand: {
          always: "#turn.checkingEventConditions.preDraw",
        },
        drawing: {
          entry: "discardCards",
          after: {
            600: { target: "ending", actions: "drawCards" },
          },
        },
        ending: {
          entry: "endTurn",
          after: {
            600: "#turn",
          },
        },
      },
    },
    checkingEventConditions: {
      initial: "main",
      states: {
        preDraw: {
          always: [
            {
              target: "#turn.stagingEvent.noBuyDisaster",
              guard: and([
                "getsDidNotBuyDisaster",
                ({ context }) => TurnMachineGuards.checkNotDone({ context }, "noBuyCheck"),
              ]),
            },
            {
              target: "#turn.stagingEvent.elementalDisaster",
              guard: and([
                "getsElementalDisaster",
                ({ context }) => TurnMachineGuards.checkNotDone({ context }, "elementalDisasterCheck"),
              ]),
            },
            {
              target: "main",
            },
          ],
        },
        main: {
          always: [
            {
              target: "#turn.stagingEvent.massExtinction",
              guard: and([
                "getsMassExtinction",
                ({ context }) => TurnMachineGuards.checkNotDone({ context }, "extinctionCheck"),
              ]),
            },
            {
              target: "#turn.stagingEvent.extinction",
              guard: and([
                "getsExtinction",
                ({ context }) => TurnMachineGuards.checkNotDone({ context }, "extinctionCheck"),
              ]),
            },
            {
              target: "#turn.stagingEvent.abilityRefresh",
              guard: "canRefreshAbility",
            },
            {
              target: "#turn.stagingEvent.habitatUnlock",
              guard: "canUnlockHabitats",
            },
            {
              target: "#turn.endingTurn.ending",
              guard: "drawPhase",
            },
            {
              target: "#turn.endingTurn.drawing",
              guard: "endPhase",
            },
            {
              target: "#turn.buying",
              guard: "actionPhase",
            },
          ],
        },
      },
    },
    stagingEvent: {
      tags: ["stagingEvent"],
      initial: "idle",
      on: {
        "user.click.token": {
          target: ".abilityRefresh.awaitingConfirmation",
          actions: { type: "refreshAbility", params: ({ event: { token } }) => token.uid },
        },
      },
      states: {
        habitatUnlock: {
          initial: "awaitingConfirmation",
          entry: "stageHabitatUnlock",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              after: {
                1200: { target: "#turn.buying" },
              },
            },
          },
        },
        abilityRefresh: {
          initial: "awaitingConfirmation",
          entry: "stageAbilityRefresh",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              after: {
                1200: { target: "#turn.buying" },
              },
            },
          },
        },
        elementalDisaster: {
          initial: "awaitingConfirmation",
          entry: "stageDuplicateElementsDisaster",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              entry: {
                type: "markCheckAsDone",
                params: "elementalDisasterCheck",
              },
              after: {
                1200: { target: "#turn.checkingEventConditions.preDraw" },
              },
            },
          },
        },
        extinction: {
          initial: "awaitingConfirmation",
          entry: "stageExtinction",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              entry: {
                type: "markCheckAsDone",
                params: "extinctionCheck",
              },
              after: {
                1200: { target: "#turn.endingTurn.drawing" },
              },
            },
          },
        },
        massExtinction: {
          initial: "awaitingConfirmation",
          entry: "stageMassExtinction",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              entry: {
                type: "markCheckAsDone",
                params: "extinctionCheck",
              },
              after: {
                1200: { target: "#turn.endingTurn" },
              },
            },
          },
        },
        noBuyDisaster: {
          initial: "awaitingConfirmation",
          entry: "stageNoActionDisaster",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              entry: {
                type: "markCheckAsDone",
                params: "noBuyCheck",
              },
              after: {
                1200: { target: "#turn.checkingEventConditions.preDraw" },
              },
            },
          },
        },
      },
    },
    buying: {
      on: {
        "user.click.token": [
          {
            target: "#turn.usingAbility",
            actions: assign({
              turn: ({ context: { turn }, event: { token } }) => ({
                ...turn,
                currentAbility: { piece: token, name: token.name },
              }),
            }),
            guard: {
              type: "abilityAvailable",
              params: ({ event: { token } }) => token,
            },
          },
          {
            actions: { type: "refreshAbility", params: ({ event: { token } }) => token.uid },
            guard: "canRefreshAbility",
          },
        ],
        "user.click.player.endTurn": [{ target: "endingTurn" }],
        "user.click.market.deck.element": {
          actions: { type: "borrowElement", params: ({ event: { name } }) => name },
          guard: "belowBorrowLimit",
        },
        "user.click.market.borrowed.card.element": {
          actions: {
            type: "unBorrowElement",
            params: ({ event: { card } }) => card,
          },
        },
        "user.click.player.hand.card": [
          {
            target: "#turn",
            actions: {
              type: "playCard",
              params: ({ event: { card } }) => card.uid,
            },
            guard: and([
              ({ context, event }) => TurnMachineGuards.notExhausted({ context }, event.card.uid),
              ({ context, event }) => TurnMachineGuards.notPlayedCard({ context }, event.card.uid),
              ({ context, event }) => TurnMachineGuards.ownsCard({ context }, event.card.uid),
              ({ context, event }) => TurnMachineGuards.notDisasterCard({ context }, event.card),
            ]),
          },
          {
            target: "#turn",
            actions: {
              type: "unPlayCard",
              params: ({ event: { card } }) => card.uid,
            },
            guard: and([
              ({ context, event }) => TurnMachineGuards.notExhausted({ context }, event.card.uid),
              ({ context, event }) => TurnMachineGuards.ownsCard({ context }, event.card.uid),
            ]),
          },
        ],
        "user.click.market.table.card": {
          target: "#turn",
          actions: {
            type: "buyCard",
            params: ({ event: { card } }) => card,
          },
          guard: { type: "canBuyCard", params: ({ event: { card } }) => card },
        },
        "user.click.player.hand.card.ability": [
          {
            target: "#turn.cardAbility",
            actions: { type: "markAbilityCardAsSelected", params: ({ event: { card } }) => card },
            guard: { type: "abilityCardAvailable", params: ({ event: { card } }) => card },
          },
        ],
      },
    },

    cardAbility: {
      on: {
        "user.click.*": { target: "#turn", actions: "cancelAbilitySelection" },
        "user.click.cardToken": {
          target: "#turn.usingAbility",
          actions: assign({
            turn: ({ context: { turn }, event: { name } }) => ({
              ...turn,
              currentAbility: { piece: turn.selectedAbilityCard!, name },
            }),
          }),
        },
      },
    },

    usingAbility: {
      tags: ["usingAbility"],
      initial: "idle",
      states: {
        idle: {
          always: [
            { target: "plussing", guard: "isPlusAbility" },
            { target: "moving", guard: "isMoveAbility" },
            { target: "refreshing", guard: "isRefreshAbility" },
            { target: "usingSpecial", guard: "isSpecialAbility" },
          ],
        },
        plussing: {
          always: {
            target: "done",
            actions: "drawPlayerDeck",
          },
        },
        moving: {
          initial: "pickingTarget",
          states: {
            pickingTarget: {
              on: {
                "user.click.token": {
                  target: "#turn.usingAbility.cancel",
                },
                "user.click.player.hand.card": {
                  target: "pickingDestination",
                  actions: { type: "setAbilityTargetCard", params: ({ event: { card } }) => card },
                  guard: { type: "ownsCard", params: ({ event: { card } }) => card.uid },
                },
              },
            },
            pickingDestination: {
              on: {
                "user.click.token": {
                  target: "#turn.usingAbility.cancel",
                },
                "user.click.player.hand.card": {
                  target: "#turn.usingAbility.done",
                  guard: not(({ context, event }) => TurnMachineGuards.cardFromRow({ context }, event.card)),
                  actions: { type: "cardToPlayerHand", params: ({ event }) => event.card },
                },
                "user.click.market.deck.animal": {
                  target: "#turn.usingAbility.done",
                  actions: { type: "cardToAnimalDeck" },
                  guard: {
                    type: "abilityTargetCardTypeIs",
                    params: "animal",
                  },
                },
                "user.click.market.deck.plant": {
                  target: "#turn.usingAbility.done",
                  actions: { type: "cardToPlantDeck" },
                  guard: {
                    type: "abilityTargetCardTypeIs",
                    params: "plant",
                  },
                },
                "user.click.market.deck.element": {
                  target: "#turn.usingAbility.done",
                  actions: { type: "cardToElementDeck" },
                  guard: and([
                    ({ context }) => TurnMachineGuards.abilityTargetCardTypeIs({ context }, "element"),
                    ({ context, event }) => TurnMachineGuards.abilityTargetCardNameIs({ context }, event.name),
                  ]),
                },
              },
            },
          },
        },
        refreshing: {
          on: {
            "user.click.token": {
              target: "#turn.usingAbility.cancel",
            },
            "user.click.market.deck.animal": {
              target: "#turn.usingAbility.done",
              actions: "refreshAnimalDeck",
            },
            "user.click.market.deck.plant": {
              target: "#turn.usingAbility.done",
              actions: "refreshPlantDeck",
            },
          },
        },
        usingSpecial: {
          always: "done",
        },
        done: {
          always: {
            target: "#turn",
            actions: "markAbilityAsUsed",
          },
        },
        cancel: {
          always: {
            target: "#turn.buying",
            action: "cancelAbility",
          },
        },
      },
    },
  },
});
