import { setup, and, not } from "xstate";
import {
  AbilityTile,
  AbilityUID,
  AnimalCard,
  Card,
  ElementCard,
  GameConfig,
  GameState,
  PlantCard,
  UiState,
  AbilityName,
  isAbilityUID,
  PolicyCard,
  HabitatName,
  GamePiece,
} from "@/state/types";
import { assign } from "@/state/machines/assign";
import { DeckConfig } from "@/decks/schema";
import { spawnDeck } from "@/state/deck-spawner";
import { produce } from "immer";
import { TurnMachineGuards } from "@/state/machines/guards";
import { compact, concat, countBy, entries, find, first, intersection, isEmpty, map, reject, without } from "lodash-es";
import { calculateDurations, replaceItem, shuffle } from "@/state/utils";
import {
  getAnimalHabitatPairs,
  getDuplicateElements,
  getPlayedAnimalsForHabitatUnlock,
  getSharedHabitats,
} from "./helpers/turn";
import { toUiState } from "@/state/ui/positioner";
import { capitalize, getCardComparator } from "@/lib/utils";
import { expansionActions, expansionCardsEndTurnActions, expansionConditionChecks, expansionState } from "./expansion";
import i18n from "@/i18n";
import { t } from "i18next";

type MachineConfig = {
  animSpeed?: number;
  ui?: UiState;
  isStageAutoConfirm?: boolean;
  isLoggingEvents?: boolean;
};
export type TurnMachineContext = GameState & MachineConfig;
export type TurnMachineEvent =
  | { type: "user.click.player.endTurn" }
  | { type: "user.click.token"; token: AbilityTile }
  | { type: "user.click.player.hand.card"; card: Card }
  | { type: "user.click.market.deck.habitat"; name: HabitatName }
  | { type: "user.click.market.deck.element"; name: ElementCard["name"] }
  | { type: "user.click.market.borrowed.card.element"; card: ElementCard }
  | { type: "user.click.market.table.card"; card: PlantCard | AnimalCard }
  | { type: "iddqd"; context: Partial<TurnMachineContext> }
  | { type: "user.click.player.hand.card.token"; card: AnimalCard | PlantCard; abilityName: AbilityName }
  | { type: "user.click.stage.confirm" }
  | { type: "user.click.stage.showCards" }
  | { type: "user.click.stage.hideCards" }
  | { type: "user.click.market.deck.animal" }
  | { type: "user.click.market.deck.plant" }
  | { type: "user.click.player.deck" }
  | { type: "user.click.policy.card.acquired"; card: PolicyCard }
  | { type: "user.click.policies.cancel" }
  | { type: "user.click.ability.cancel" }
  | { type: "internal.target.selected"; target: Card };

export type TurnMachineInput = {
  deckConfig: DeckConfig;
  gameConfig: GameConfig;
  animSpeed: number;
};
export const TurnMachine = setup({
  types: {
    context: {} as TurnMachineContext,
    input: {} as TurnMachineInput,
    events: {} as TurnMachineEvent,
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
            turn.borrowedElement = undefined;
          }

          const drawnCard = draft.plantMarket.deck.shift();
          if (drawnCard !== undefined) {
            draft.plantMarket.table = replaceItem(card, drawnCard, draft.plantMarket.table);
          } else {
            draft.plantMarket.table = without(context.plantMarket.table, card);
          }
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

          const drawnCard = draft.animalMarket.deck.shift();
          if (drawnCard !== undefined) {
            draft.animalMarket.table = replaceItem(card, drawnCard, draft.animalMarket.table);
          } else {
            draft.animalMarket.table = without(context.animalMarket.table, card);
          }
          draft.turn.boughtAnimal = true;
        }

        draft.turn.playedCards = without(draft.turn.playedCards, ...draft.turn.exhaustedCards);
        player.hand.push(card);
      }),
    ),
    drawOneCard: assign(({ context }) =>
      produce(context, ({ turn, players }) => {
        const player = players.find(({ uid }) => uid === turn.player)!;

        if (player.deck.length === 0) {
          player.deck = shuffle(player.discard, context.config.seed);
          player.discard = [];
        }

        const drawnCard = player.deck.shift();
        if (drawnCard) player.hand.push(drawnCard);
        player.hand = [...player.hand].sort(getCardComparator(context.deck.ordering));
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
        const player = players.find(({ uid }) => uid === turn.player)!;
        player.hand = reject(player.hand, turn.currentAbility?.targetCard);
        if (turn.currentAbility?.targetCard !== undefined) {
          plantMarket.deck.push(turn.currentAbility.targetCard as PlantCard);
        }
      }),
    ),
    cardToPlayerHand: assign(({ context }, card: Card) =>
      produce(context, ({ players, turn }) => {
        const player = find(players, { uid: context.turn.player })!;
        const targetPlayer = players.find((player) => player.hand.some((handCard) => handCard.uid === card.uid));

        if (!targetPlayer || context.turn.currentAbility?.targetCard === undefined) return;

        player.hand = reject(player.hand, context.turn.currentAbility.targetCard);
        targetPlayer.hand.push(context.turn.currentAbility.targetCard);
        turn.playedCards = without(context.turn.playedCards, context.turn.currentAbility.targetCard.uid);
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

        const ability = find(player.abilities, { uid: context.turn.currentAbility?.piece?.uid });

        if (ability && isAbilityUID(ability.uid)) {
          (ability as AbilityTile).isUsed = true;
        }

        turn.usedAbilities.push({
          source: context.turn.currentAbility.piece.uid,
          name: context.turn.currentAbility.name,
        });
        turn.currentAbility = undefined;
      }),
    ),
    cancelAbility: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.turn.currentAbility = undefined;
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
          outcome: "negative",
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
          outcome: "positive",
        };
      }),
    ),
    stagePolicyDraw: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const policyCard = context.policyMarket.deck[0];

        if (policyCard.effect === "positive") {
          draft.policyMarket.acquired.push(policyCard);
        } else if (policyCard.effect === "implementation") {
          draft.policyMarket.funding.push(policyCard);
        } else {
          draft.policyMarket.table.push(policyCard);
          draft.policyMarket.active.push(policyCard);
        }

        draft.policyMarket.deck = without(context.policyMarket.deck, policyCard);
        const cardEffect = policyCard.effect;
        const hasFunding = TurnMachineGuards.hasSufficientFunding({ context });
        const isMeasureCard = cardEffect === "positive";
        const isHabitatAutoDraw = draft.turn.automaticPolicyDraw?.cause === "habitat";
        const isExtinctionAutoDraw = draft.turn.automaticPolicyDraw?.cause === "extinction";

        const base = "policy_policy";
        const cause = isHabitatAutoDraw ? "AutoDrawHabitat" : isExtinctionAutoDraw ? "AutoDrawExtinction" : "Draw";
        const effect = isMeasureCard
          ? (`Positive${hasFunding ? "HasFunding" : "NoFunding"}` as const)
          : capitalize(cardEffect);
        const eventType = `${base}${cause}${effect}` as const;

        const effectUids = isHabitatAutoDraw ? draft.turn.unlockedHabitats : undefined;

        draft.stage = {
          eventType,
          effect: effectUids,
          cause: [policyCard.uid],
          outcome: policyCard.effect === "positive" || policyCard.effect === "implementation" ? "positive" : "negative",
        };
        draft.turn.automaticPolicyDraw = undefined;
      }),
    ),
    stageGameWin: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.stage = {
          eventType: "gameWin",
          terminationEvent: true,
          cause: undefined,
          effect: map(context.habitatMarket.deck, "uid"),
          outcome: "positive",
        };
      }),
    ),
    stageGameLoss: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.stage = {
          eventType: "gameLoss",
          terminationEvent: true,
          cause: undefined,
          effect: map(context.extinctMarket.table, "uid"),
          outcome: "negative",
        };
      }),
    ),
    stageCardBuy: assign(({ context }: { context: GameState }, card: AnimalCard | PlantCard) =>
      produce(context, (draft) => {
        draft.stage = {
          eventType: "cardBuy",
          cause: undefined,
          effect: [card.uid],
          outcome: "positive",
        };
      }),
    ),
    stageHabitatUnlock: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const playedAnimals = getPlayedAnimalsForHabitatUnlock({ context });
        const sharedHabitats = context.habitatMarket.deck.filter(
          (marketHabitat) => !marketHabitat.isAcquired && getSharedHabitats(playedAnimals).includes(marketHabitat.name),
        );

        if (sharedHabitats.length === 0) return;

        draft.habitatMarket.deck = context.habitatMarket.deck.map((habitatTile) => {
          return {
            ...habitatTile,
            isAcquired:
              habitatTile.isAcquired || sharedHabitats.some((sharedHabitat) => sharedHabitat.name === habitatTile.name),
          };
        });
        draft.turn.unlockedHabitat = true;
        draft.turn.playedCards = without(context.turn.playedCards, ...map(playedAnimals, "uid"));
        draft.turn.exhaustedCards = [...draft.turn.exhaustedCards, ...map(playedAnimals, "uid")];
        draft.turn.unlockedHabitats = sharedHabitats.map(({ uid }) => uid);

        draft.stage = {
          eventType: "habitatUnlock",
          cause: map(playedAnimals, "uid"),
          effect: map(sharedHabitats, "uid"),
          outcome: "positive",
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
          ...(player.hand.filter((card) => card.type === "animal") as AnimalCard[]),
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
          outcome: "positive",
        };
      }),
    ),
    stageExtinction: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = find(draft.players, { uid: draft.turn.player })!;
        const disasterCards = player?.hand.filter((card) => card.type === "disaster");
        const extinctionTiles = context.extinctMarket.deck.slice(0, 1);

        // TODO: Figure out what to do when extinction deck is empty
        if (isEmpty(extinctionTiles)) return;

        draft.extinctMarket.deck = without(context.extinctMarket.deck, ...extinctionTiles);
        draft.extinctMarket.table = concat(draft.extinctMarket.table, extinctionTiles);

        draft.stage = {
          eventType: "extinction",
          cause: map(disasterCards, "uid"),
          effect: map(extinctionTiles, "uid"),
          outcome: "negative",
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
          outcome: "negative",
        };
      }),
    ),
    stageAbilityUseBlocked: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.stage = {
          eventType: "abilityUseBlocked",
          cause: context.blockers.ability.reasons,
          effect: undefined,
          outcome: "negative",
        };
      }),
    ),
    stageSkipTurn: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.stage = {
          eventType: "skipTurn",
          cause: context.blockers.turn.reasons,
          effect: undefined,
          outcome: "negative",
        };
      }),
    ),
    unstage: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        draft.stage = undefined;
      }),
    ),
    blockAbilityUse: assign(({ context }: { context: GameState }, reasons: GamePiece["uid"]) =>
      produce(context, (draft) => {
        draft.blockers.ability.isBlocked = true;
        draft.blockers.ability.reasons = [...draft.blockers.ability.reasons, reasons];
      }),
    ),
    unblockAbilityUse: assign(({ context }: { context: GameState }, reasons: GamePiece["uid"]) =>
      produce(context, (draft) => {
        draft.blockers.ability.reasons = without(draft.blockers.ability.reasons, reasons);
        if (draft.blockers.ability.reasons.length === 0) {
          draft.blockers.ability.isBlocked = false;
        }
      }),
    ),
    drawCards: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const player = draft.players[0];
        player.hand = player.deck.slice(0, 4);
        player.deck = player.deck.slice(player.hand.length);

        if (player.hand.length < 4) {
          player.deck = shuffle(player.discard, context.config.seed);
          player.discard = [];

          const remainingDraw = 4 - player.hand.length;
          player.hand = concat(player.hand, player.deck.slice(0, remainingDraw));
          player.deck = player.deck.slice(remainingDraw);
        }

        player.hand = [...player.hand].sort(getCardComparator(context.deck.ordering));
      }),
    ),

    clearTurnStateAndSwitchPlayer: assign(({ context }: { context: GameState }) => {
      const currentPlayer = context.players.find((player) => player.uid === context.turn.player)!;
      const newPlayers = [...without(context.players, currentPlayer), currentPlayer];
      // note that for single player nextPlayer === currentPlayer
      const nextPlayer = newPlayers[0];

      return {
        players: [
          {
            ...nextPlayer,
            hand: [...nextPlayer.hand].sort(getCardComparator(context.deck.ordering)),
          },
          ...without(newPlayers, nextPlayer),
        ],
        elementMarket: {
          ...context.elementMarket,
          deck: context.turn.borrowedElement
            ? [context.turn.borrowedElement, ...context.elementMarket.deck]
            : context.elementMarket.deck,
        },
        turn: {
          player: nextPlayer.uid,
          currentAbility: undefined,
          exhaustedCards: [],
          playedCards: [],
          borrowedElement: undefined,
          usedAbilities: [],
          boughtAnimal: false,
          boughtPlant: false,
          unlockedHabitat: false,
          unlockedHabitats: [],
          uidsUsedForAbilityRefresh: [],
          refreshedAbilityUids: [],
          selectedAbilityCard: undefined,
          automaticEventChecks: [],
          phase: "action" as const,
          automaticPolicyDraw: undefined,
        },
      };
    }),
    refreshAbility: assign(({ context }: { context: GameState }, abilityUid: AbilityUID) =>
      produce(context, ({ players, turn }) => {
        const player = find(players, { uid: context.turn.player })!;
        const ability = find(player.abilities, { uid: abilityUid });
        if (!ability) return;

        const stagedAnimals = player.hand.filter(
          (card) => card.type === "animal" && context.stage?.cause?.includes(card.uid),
        ) as AnimalCard[];

        const availableAnimalHabitatPairs = getAnimalHabitatPairs([
          ...(player.hand.filter((card) => card.type === "animal") as AnimalCard[]),
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
        turn.refreshedAbilityUids.push(abilityUid);
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
    cardToPlayerSupply: assign(({ context }: { context: GameState }, card: Card) =>
      produce(context, ({ players }) => {
        const player = find(players, { uid: context.turn.player })!;
        player.deck = [card, ...player.deck];
        player.hand = reject(player.hand, { uid: card.uid });
      }),
    ),

    setContext: assign(({ context }, newContext: Partial<TurnMachineContext>) => ({ ...context, ...newContext })),

    unlockPolicyCard: assign(({ context }: { context: GameState }, card: PolicyCard) =>
      produce(context, (draft) => {
        draft.policyMarket.acquired = without(context.policyMarket.acquired, card);
        draft.policyMarket.table.push(card);
        const fundingCard = context.policyMarket.funding.slice(0, 1);
        draft.policyMarket.funding = without(context.policyMarket.funding, ...fundingCard);
        draft.policyMarket.exhausted = concat(context.policyMarket.exhausted, fundingCard);
        draft.policyMarket.active.push(card);
      }),
    ),

    cancelPolicyCard: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        const activePolicyCard = first(context.policyMarket.active);

        if (!activePolicyCard) {
          return;
        }

        draft.policyMarket.active = without(context.policyMarket.active, activePolicyCard);
        draft.policyMarket.acquired = concat(context.policyMarket.acquired, activePolicyCard);
        const fundingCard = context.policyMarket.exhausted.slice(0, 1);
        draft.policyMarket.exhausted = without(context.policyMarket.exhausted, ...fundingCard);
        draft.policyMarket.funding = concat(context.policyMarket.funding, fundingCard);
        draft.commandBar = undefined;
      }),
    ),

    setAutomaticPolicyDraw: assign(
      ({ context }: { context: GameState }, cause: NonNullable<GameState["turn"]["automaticPolicyDraw"]>["cause"]) =>
        produce(context, ({ turn }) => {
          turn.automaticPolicyDraw = TurnMachineGuards.isExpansionActive({ context }) ? { cause } : undefined;
        }),
    ),

    setCommandBar: assign(({ context }: { context: GameState }, text: string | undefined) =>
      produce(context, (draft) => {
        if (text === undefined) {
          draft.commandBar = undefined;
          return;
        }

        draft.commandBar = {
          text,
        };
      }),
    ),

    stageShowCards: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        if (!draft.stage) return;

        draft.stage.hidden = true;
        draft.commandBar = {
          text: t("commandBar.backToStageEvent"),
        };
      }),
    ),

    stageHideCards: assign(({ context }: { context: GameState }) =>
      produce(context, (draft) => {
        if (!draft.stage) return;

        draft.stage.hidden = undefined;
        draft.commandBar = undefined;
      }),
    ),

    ...expansionActions,
  },
  guards: {
    ...TurnMachineGuards,
  },
  delays: {
    animationDuration: ({ context: { ui, animSpeed } }) => {
      const maxDuration = Math.max(
        ...Object.values(ui!.cardPositions).map(
          (appearance) => calculateDurations(appearance, animSpeed!).totalDuration,
        ),
      );
      const duration = maxDuration * 1000;
      // console.log("waining for", ~~duration, "ms");
      return duration;
    },
  },
}).createMachine({
  id: "turn",
  context: ({ input: { deckConfig, gameConfig, animSpeed } }) => {
    const gameState = spawnDeck(deckConfig, gameConfig);
    return {
      ...gameState,
      animSpeed,
      ui: toUiState(null, gameState),
      isStageAutoConfirm: false,
      isLoggingEvents: false,
    };
  },
  initial: "checkingEventConditions",

  on: {
    iddqd: {
      actions: {
        type: "setContext",
        params: ({ event: { context } }) => context,
      },
    },
    "user.click.policies.cancel": {
      target: "#turn.buying",
      actions: "cancelPolicyCard",
      guard: and([
        not(({ context }) => TurnMachineGuards.isPolicyCancellationBlocked({ context })),
        ({ context }) => TurnMachineGuards.isActivePolicyCardPositive({ context }),
      ]),
    },
    "user.click.stage.showCards": {
      actions: "stageShowCards",
    },
    "user.click.stage.hideCards": {
      actions: "stageHideCards",
    },
  },

  states: {
    hist: {
      type: "history",
      history: "deep",
    },
    endingTurn: {
      entry: "setEndOfTurnPhase",
      initial: "checkingEndHand",
      states: {
        checkingEndHand: {
          after: {
            animationDuration: "#turn.checkingEventConditions.preDraw",
          },
        },
        discardingRow: {
          after: {
            animationDuration: "drawingRow",
          },
          exit: "discardCards",
        },
        drawingRow: {
          after: {
            animationDuration: "expansionCardStatesUpdating",
          },
          exit: "drawCards",
        },
        expansionCardStatesUpdating: {
          after: {
            // @ts-expect-error dunno why
            animationDuration: {
              target: "clearingTurnState",
              actions: expansionCardsEndTurnActions,
            },
          },
        },
        clearingTurnState: {
          after: {
            animationDuration: "#turn",
          },
          exit: "clearTurnStateAndSwitchPlayer",
        },
      },
    },
    checkingEventConditions: {
      initial: "main",
      on: {
        "user.click.player.endTurn": [{ target: "endingTurn" }],
      },
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
              target: "main",
            },
          ],
        },

        main: {
          always: [
            {
              target: "#turn.stagingEvent.gameWon",
              guard: "gameWon",
            },
            {
              target: "#turn.stagingEvent.gameLost",
              guard: "gameLost",
            },
            {
              target: "#turn.stagingEvent.drawingPolicy",
              guard: "shouldAutomaticallyDrawPolicy",
            },
            {
              target: "#turn.stagingEvent.skipTurn",
              guard: "isTurnBlocked",
              actions: "stageSkipTurn",
            },
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
              target: "#turn.stagingEvent.elementalDisaster",
              guard: and([
                "getsElementalDisaster",
                ({ context }) => TurnMachineGuards.checkNotDone({ context }, "elementalDisasterCheck"),
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
            // @ts-expect-error dunno why
            ...expansionConditionChecks,
            // @ts-expect-error dunno why
            {
              target: "#turn.endingTurn.discardingRow",
              guard: "endPhase",
            },
            // @ts-expect-error dunno why
            {
              target: "#turn.buying",
              guard: "actionPhase",
            },
          ],
        },
      },
    },
    ...expansionState,
    stagingEvent: {
      tags: ["stagingEvent"],
      initial: "idle",

      states: {
        skipTurn: {
          on: {
            "user.click.stage.confirm": {
              actions: "unstage",
              target: "#turn.endingTurn.expansionCardStatesUpdating",
            },
          },
        },
        abilityUseBlocked: {
          on: {
            "user.click.stage.confirm": { actions: "unstage", target: "#turn" },
          },
        },
        drawingPolicy: {
          entry: "stagePolicyDraw",
          on: {
            "user.click.stage.confirm": { actions: "unstage", target: "#turn.usingAbility.done" },
            "user.click.policy.card.acquired": {
              target: "#turn.usingAbility.done",
              actions: [{ type: "unlockPolicyCard", params: ({ event }) => event.card }, { type: "unstage" }],
              guard: "hasSufficientFunding",
            },
          },
        },
        cardBuy: {
          initial: "awaitingConfirmation",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
              after: {
                animationDuration: {
                  target: "#turn",
                  actions: "unstage",
                  guard: "isStageAutoConfirm",
                },
              },
            },
            transitioning: {
              after: {
                animationDuration: { target: "#turn" },
              },
            },
          },
        },
        gameWon: {
          initial: "awaitingConfirmation",
          entry: "stageGameWin",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              after: {
                animationDuration: { target: "#turn" },
              },
            },
          },
        },
        gameLost: {
          initial: "awaitingConfirmation",
          entry: "stageGameLoss",
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": {
                  actions: "unstage",
                  target: "transitioning",
                },
              },
            },
            transitioning: {
              after: {
                animationDuration: { target: "#turn" },
              },
            },
          },
        },
        habitatUnlock: {
          initial: "awaitingConfirmation",
          entry: ["stageHabitatUnlock", { type: "setAutomaticPolicyDraw", params: "habitat" }],
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              after: {
                animationDuration: { target: "#turn" },
              },
            },
          },
        },
        abilityRefresh: {
          initial: "checkingAutomaticRefresh",
          entry: "stageAbilityRefresh",
          states: {
            checkingAutomaticRefresh: {
              after: {
                animationDuration: [
                  {
                    target: "awaitingConfirmation",
                    actions: {
                      type: "refreshAbility",
                      params: ({ context }) =>
                        find(context.players, { uid: context.turn.player })!.abilities.filter(
                          (ability) => ability.isUsed,
                        )[0]!.uid,
                    },
                    guard: "singleAbilityUsed",
                  },
                  { target: "awatingTokenPick" },
                ],
              },
            },
            awatingTokenPick: {
              on: {
                "user.click.token": {
                  target: "awaitingConfirmation",
                  guard: { type: "isAbilityUsed", params: ({ event: { token } }) => token },
                  actions: { type: "refreshAbility", params: ({ event: { token } }) => token.uid },
                },
              },
            },
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": {
                  actions: "unstage",
                  target: "transitioning",
                  guard: "stageCardsUsedForAbilityRefresh",
                },
              },
            },
            transitioning: {
              after: {
                animationDuration: { target: "#turn" },
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
                params: () => "elementalDisasterCheck",
              },
              after: {
                animationDuration: { target: "#turn.endingTurn.discardingRow" },
              },
            },
          },
        },
        extinction: {
          initial: "awaitingConfirmation",
          entry: ["stageExtinction", { type: "setAutomaticPolicyDraw", params: "extinction" }],
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              entry: {
                type: "markCheckAsDone",
                params: () => "extinctionCheck",
              },
              after: {
                animationDuration: [
                  { target: "#turn.climateChange", guard: { type: "isPolicyCardActive", params: "Climate change" } },
                  { target: "#turn.endingTurn" },
                ],
              },
            },
          },
        },
        massExtinction: {
          initial: "awaitingConfirmation",
          entry: ["stageMassExtinction", { type: "setAutomaticPolicyDraw", params: "extinction" }],
          states: {
            awaitingConfirmation: {
              on: {
                "user.click.stage.confirm": { actions: "unstage", target: "transitioning" },
              },
            },
            transitioning: {
              entry: {
                type: "markCheckAsDone",
                params: () => "extinctionCheck",
              },
              after: {
                animationDuration: [
                  { target: "#turn.climateChange", guard: { type: "isPolicyCardActive", params: "Climate change" } },
                  { target: "#turn.endingTurn" },
                ],
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
                params: () => "noBuyCheck",
              },
              after: {
                animationDuration: { target: "#turn.checkingEventConditions.preDraw" },
              },
            },
          },
        },
      },
    },

    buying: {
      on: {
        "user.click.policy.card.acquired": {
          target: "#turn",
          actions: { type: "unlockPolicyCard", params: ({ event }) => event.card },
          guard: "hasSufficientFunding",
        },
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
            guard: and([
              "canRefreshAbility",
              ({ context, event }) => TurnMachineGuards.isAbilityUsed({ context }, event.token),
            ]),
          },
        ],
        "user.click.player.endTurn": [{ target: "endingTurn" }],
        "user.click.market.deck.element": {
          actions: { type: "borrowElement", params: ({ event: { name } }) => name },
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
              ({ context, event }) => TurnMachineGuards.notLitterCard({ context }, event.card),
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
          target: "#turn.stagingEvent.cardBuy",
          actions: [
            {
              type: "buyCard",
              params: ({ event: { card } }) => card,
            },
            { type: "stageCardBuy", params: ({ event: { card } }) => card },
          ],
          guard: { type: "canBuyCard", params: ({ event: { card } }) => card },
        },
        "user.click.player.hand.card.token": {
          target: "#turn.usingAbility",
          actions: [
            assign({
              turn: ({ context: { turn }, event: { card, abilityName } }) => ({
                ...turn,
                currentAbility: {
                  piece: card,
                  name: abilityName,
                },
              }),
            }),
          ],
          guard: { type: "abilityCardAvailable", params: ({ event: { card } }) => card },
        },
      },
    },

    usingAbility: {
      tags: ["usingAbility"],
      initial: "idle",
      on: {
        "user.click.player.hand.card.token": {
          target: "#turn.usingAbility.cancel",
        },
        "user.click.token": {
          target: "#turn.usingAbility.cancel",
        },
        "user.click.player.endTurn": [{ target: "endingTurn" }],
        "user.click.ability.cancel": [{ target: "#turn.usingAbility.cancel" }],
      },
      states: {
        idle: {
          after: {
            animationDuration: [
              {
                target: "#turn.stagingEvent.abilityUseBlocked",
                guard: "isAbilityUseBlocked",
                actions: ["cancelAbility", "stageAbilityUseBlocked"],
              },
              { target: "plussing", guard: "isPlusAbility" },
              { target: "moving", guard: "isMoveAbility" },
              { target: "refreshing", guard: "isRefreshAbility" },
              { target: "usingSpecial", guard: "isSpecialAbility" },
            ],
          },
        },
        plussing: {
          after: {
            animationDuration: [
              {
                target: "done",
                actions: "drawOneCard",
                guard: "haveCardsInDeckOrDescard",
              },
              {
                target: "cancel",
                guard: not("haveCardsInDeckOrDescard"),
              },
            ],
          },
        },
        moving: {
          initial: "pickingTarget",
          entry: { type: "setCommandBar", params: () => i18n.t("abilities.commandBar.move.pickCard") },
          states: {
            pickingTarget: {
              on: {
                "user.click.player.hand.card": {
                  target: "pickingDestination",
                  actions: { type: "setAbilityTargetCard", params: ({ event: { card } }) => card },
                  guard: and([
                    ({ context, event: { card } }) => TurnMachineGuards.notExhausted({ context }, card.uid),
                    ({ context, event: { card } }) => TurnMachineGuards.ownsCard({ context }, card.uid),
                    ({ context, event: { card } }) => TurnMachineGuards.notSameCard({ context }, card),
                    ({ context, event: { card } }) =>
                      TurnMachineGuards.notDisasterCard({ context }, card) ||
                      TurnMachineGuards.isMultiplayer({ context }),
                  ]),
                },
              },
            },
            pickingDestination: {
              initial: "settingCommandBar",
              states: {
                settingCommandBar: {
                  always: [
                    {
                      target: "waitingForAction",
                      actions: {
                        type: "setCommandBar",
                        params: () => i18n.t("abilities.commandBar.move.pickDestinationSinglePlayer"),
                      },
                      guard: "isSinglePlayer",
                    },
                    {
                      target: "waitingForAction",
                      actions: {
                        type: "setCommandBar",
                        params: () => i18n.t("abilities.commandBar.move.pickDestination"),
                      },
                    },
                  ],
                },
                waitingForAction: {
                  on: {
                    "user.click.player.deck": {
                      target: "#turn.usingAbility.done",
                      guard: "isSinglePlayer",
                      actions: {
                        type: "cardToPlayerSupply",
                        params: ({ context }) => context.turn.currentAbility!.targetCard!,
                      },
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
          },
        },
        refreshing: {
          entry: { type: "setCommandBar", params: () => i18n.t("abilities.commandBar.refresh.pickMarket") },
          on: {
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
          after: {
            animationDuration: "#turn.stagingEvent.drawingPolicy",
          },
        },
        done: {
          after: {
            animationDuration: {
              target: "#turn",
              actions: ["markAbilityAsUsed", { type: "setCommandBar", params: undefined }],
            },
          },
        },
        cancel: {
          after: {
            animationDuration: {
              target: "#turn",
              actions: ["cancelAbility", { type: "setCommandBar", params: undefined }],
            },
          },
        },
      },
    },
  },
});
