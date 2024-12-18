import { AbilityTile, AnimalCard, Card, CardType, GameState, HabitatName, PlantCard } from "@/state/types";
import { countBy, find, compact, every, intersection, isEmpty, first } from "lodash";
import { getAnimalHabitatPairs, getDuplicateElements } from "./helpers/turn";
import { Tail } from "../../lib/types";

export const TurnMachineGuards = {
  canBuyCard: ({ context: { players, turn } }: { context: GameState }, card: AnimalCard | PlantCard) => {
    if (card.type === "plant") {
      const elementsCounted = countBy(card.elements);
      const player = find(players, { uid: turn.player })!;
      const playedElements =
        compact([...player.hand, turn.borrowedElement])
          .filter(({ uid }) => turn.playedCards.includes(uid) || turn.borrowedElement?.uid === uid)
          .filter(({ type }) => type === "element") ?? [];
      const playedElementsCounted = countBy(playedElements, "name");
      const hasAllElements = every(elementsCounted, (count, element) => playedElementsCounted[element] >= count);

      const notPlayedElements = player.hand
        .filter(({ type }) => type === "element")
        .filter(({ uid }) => !turn.playedCards.includes(uid))
        .filter(({ uid }) => !turn.exhaustedCards.includes(uid));
      const isBorrowedUnnecessarily = !!find(notPlayedElements, { name: turn.borrowedElement?.name });

      return !isBorrowedUnnecessarily && hasAllElements;
    }

    if (card.type === "animal") {
      const requiredHabitats = card.habitats;
      const playedPlants =
        (find(players, { uid: turn.player })
          ?.hand.filter(({ uid }) => turn.playedCards.includes(uid))
          .filter(({ type }) => type === "plant") as PlantCard[]) ?? [];

      const matchedPlants = requiredHabitats.map((reqHabitat) =>
        playedPlants.filter(({ habitats }) => habitats.includes(reqHabitat)),
      );
      return matchedPlants.some(({ length }) => length >= 2);
    }

    return false;
  },

  notPlayedCard: (
    {
      context: {
        turn: { playedCards, exhaustedCards },
      },
    }: { context: GameState },
    uid: Card["uid"],
  ) => ![...playedCards, ...exhaustedCards].includes(uid),

  ownsCard: (
    {
      context: {
        turn: { player },
        players,
      },
    }: { context: GameState },
    uid: Card["uid"],
  ) => find(players, { uid: player })?.hand.some((playerCard) => playerCard.uid === uid) ?? false,

  notDisasterCard: (_: { context: GameState }, card: Card) => {
    return card.type !== "disaster";
  },

  abilityTargetCardTypeIs: ({ context }: { context: GameState }, cardType: CardType) => {
    return context.turn.currentAbility?.targetCard?.type === cardType;
  },

  abilityTargetCardNameIs: ({ context }: { context: GameState }, name: string) => {
    return context.turn.currentAbility?.targetCard?.name === name;
  },

  notExhausted: (
    {
      context: {
        turn: { exhaustedCards },
      },
    }: { context: GameState },
    uid: Card["uid"],
  ) => !exhaustedCards.includes(uid),

  canUnlockHabitats: ({ context: { turn, players, habitatMarket } }: { context: GameState }) => {
    const { playedCards, player } = turn;

    const playedAnimals =
      (find(players, { uid: player })
        ?.hand.filter(({ uid }) => playedCards.includes(uid))
        .filter(({ type }) => type === "animal") as AnimalCard[]) ?? [];

    const animalhabitatPairs = getAnimalHabitatPairs(playedAnimals);

    return animalhabitatPairs.some(
      (animalHabitatPair) =>
        habitatMarket.deck.filter(
          (habitat) =>
            !habitat.isAcquired &&
            intersection(animalHabitatPair[0].habitats, animalHabitatPair[1].habitats).includes(habitat.name),
        ).length > 0,
    );
  },

  abilityAvailable: ({ context: { players } }: { context: GameState }, token: AbilityTile) =>
    players[0].abilities.includes(token) && !token.isUsed,

  abilityCardAvailable: ({ context }: { context: GameState }, card: PlantCard | AnimalCard) => {
    return (context.turn.usedAbilities?.filter((ability) => ability.source === card.uid).length ?? 0) === 0;
  },

  didNotBuy: ({ context: { turn } }: { context: GameState }) => {
    const { boughtPlant, boughtAnimal, unlockedHabitat } = turn;

    return !boughtPlant && !boughtAnimal && !unlockedHabitat;
  },

  getsDidNotBuyDisaster: ({ context }: { context: GameState }) => {
    const player = find(context.players, { uid: context.turn.player })!;

    return (
      TurnMachineGuards.didNotBuy({ context }) && player.hand.filter((card) => card.type === "disaster").length < 3
    );
  },

  getsElementalDisaster: ({ context }: { context: GameState }) => {
    const player = find(context.players, { uid: context.turn.player })!;

    return (
      getDuplicateElements(context, 3).length > 0 && player.hand.filter((card) => card.type === "disaster").length < 3
    );
  },

  getsExtinction: ({ context: { players, turn } }: { context: GameState }) => {
    const player = players.find(({ uid }) => uid === turn.player)!;

    return player.hand.filter((card) => card.type === "disaster").length > 2;
  },

  getsMassExtinction: ({ context: { players, turn } }: { context: GameState }) => {
    const player = players.find(({ uid }) => uid === turn.player)!;

    return player.hand.filter((card) => card.type === "disaster").length > 3;
  },

  isAbilityUsed: (_: { context: GameState }, ability: AbilityTile) => ability.isUsed,

  canRefreshAbility: ({ context }: { context: GameState }) => {
    const player = find(context.players, { uid: context.turn.player })!;
    if (!player.abilities.some((ability) => ability.isUsed)) return false;

    const stagedAnimals = player.hand.filter(
      (card) => card.type === "animal" && context.stage?.cause?.includes(card.uid),
    ) as AnimalCard[];

    const availableAnimalHabitatPairs = getAnimalHabitatPairs([
      ...(player.hand.filter((card) => card.type === "animal") as AnimalCard[]),
      ...stagedAnimals, // this guard invoked both during stage and during 'main checks'
    ]).filter(
      (animalHabitatPair) =>
        !context.turn.uidsUsedForAbilityRefresh.some((uid) =>
          animalHabitatPair.map((animal) => animal.uid).includes(uid),
        ),
    );

    return availableAnimalHabitatPairs.length > 0;
  },

  checkNotDone: ({ context }: { context: GameState }, checkName: string) => {
    return !(context.turn.automaticEventChecks?.includes(checkName) ?? false);
  },

  actionPhase: ({ context }: { context: GameState }) => {
    return context.turn.phase === "action";
  },

  endPhase: ({ context }: { context: GameState }) => {
    return context.turn.phase === "end";
  },

  isRefreshAbility: ({ context }: { context: GameState }) => context.turn.currentAbility?.name === "refresh",

  isMoveAbility: ({ context }: { context: GameState }) => context.turn.currentAbility?.name === "move",

  isPlusAbility: ({ context }: { context: GameState }) => context.turn.currentAbility?.name === "plus",

  isSpecialAbility: ({ context }: { context: GameState }) => context.turn.currentAbility?.name === "special",

  notSameCard: ({ context }: { context: GameState }, card: Card) => context.turn.currentAbility?.piece.uid !== card.uid,

  notSameToken: ({ context }: { context: GameState }, token: AbilityTile) =>
    context.turn.currentAbility?.piece.uid !== token.uid,

  cardFromRow: ({ context }: { context: GameState }, card: Card) => {
    const player = find(context.players, { uid: context.turn.player })!;

    return !!find(player.hand, { uid: card.uid });
  },

  singleAbilityUsed: ({ context }: { context: GameState }) => {
    const player = find(context.players, { uid: context.turn.player })!;

    return player.abilities.filter((ability) => ability.isUsed).length === 1;
  },

  isMultiplayer: ({ context: { players } }: { context: GameState }) => {
    return players.length > 1;
  },

  gameLost: ({ context: { extinctMarket } }: { context: GameState }) => {
    return isEmpty(extinctMarket.deck) && !isEmpty(extinctMarket.table);
  },

  gameWon: ({ context: { habitatMarket } }: { context: GameState }) => {
    return habitatMarket.deck
      .filter((habitatTile) => habitatTile.name !== "baltic")
      .every((habitatTile) => habitatTile.isAcquired);
  },

  stageCardsUsedForAbilityRefresh: ({ context: { turn, stage } }: { context: GameState }) =>
    //@ts-expect-error uid type mismatch doesnt matter
    stage?.cause?.every((uid) => turn.uidsUsedForAbilityRefresh.includes(uid)) ?? false,

  isOnStage: ({ context: { stage } }: { context: GameState }, card: Card) => {
    return stage?.cause?.includes(card.uid) ?? false;
  },

  isCardBuyStageEvent: ({ context: { stage } }: { context: GameState }) => {
    return stage?.eventType === "cardBuy";
  },

  haveCardsInDeckOrDescard: ({ context: { turn, players } }: { context: GameState }) => {
    const player = find(players, { uid: turn.player })!;
    return player.deck.length > 0 || player.discard.length > 0;
  },

  // @ts-expect-error switch to TurnMachineContext
  isStageAutoConfirm: ({ context: { isStageAutoConfirm } }: { context: GameState }) => isStageAutoConfirm,

  hasSufficientFunding: ({ context }: { context: GameState }) => {
    return context.policyMarket.funding.length > 0;
  },

  isPlantCard: ({ context: _ }: { context: GameState }, card: Card) => card.type === "plant",

  isAnimalCard: ({ context: _ }: { context: GameState }, card: Card) => card.type === "animal",

  isDisasterCard: ({ context: _ }: { context: GameState }, card: Card) => card.type === "disaster",

  isBirdCard: ({ context: _ }: { context: GameState }, card: Card) =>
    card.type === "animal" && card.faunaType === "bird",

  isFishCard: ({ context: _ }: { context: GameState }, card: Card) =>
    card.type === "animal" && card.faunaType === "fish",

  hasSharedHabitatInHand: ({ context }: { context: GameState }, card: PlantCard) => {
    const player = find(context.players, { uid: context.turn.player })!;

    return card.habitats.some((habitatName) =>
      player.hand
        .filter((card) => card.type == "animal")
        .some((animalCard) => animalCard.habitats.includes(habitatName)),
    );
  },

  hasSharedHabitat: (
    { context: _ }: { context: GameState },
    { plantCard, animalCard }: { plantCard: PlantCard; animalCard: AnimalCard },
  ) => plantCard.habitats.some((habitatName) => animalCard.habitats.includes(habitatName)),

  isPolicyCardActive: ({ context }: { context: GameState }, policyCardName: string) =>
    context.policyMarket.active.some((policyCard) => policyCard.name === policyCardName),

  isSinglePlayer: ({ context: { players } }: { context: GameState }) => players.length === 1,

  playerHasDisasterCardInHand: ({ context: { players } }: { context: GameState }) =>
    players.some((player) => player.hand.some((card) => card.type === "disaster")),

  habitatUnlocked: ({ context: { habitatMarket } }: { context: GameState }, habitatName: HabitatName) =>
    find(habitatMarket.deck, { name: habitatName })?.isAcquired ?? false,

  isAbilityUseBlocked: ({ context }: { context: GameState }) => context.blockers.ability.isBlocked,

  isTurnBlocked: ({ context }: { context: GameState }) => context.blockers.turn.isBlocked,

  notLitterCard: ({ context: _ }: { context: GameState }, card: Card) =>
    !(card.type === "policy" && card.theme === "litter"),

  isPolicyCancellationBlocked: ({ context }: { context: GameState }) => context.blockers.policyCancellation.isBlocked,

  isActivePolicyCardPositive: ({ context }: { context: GameState }) =>
    first(context.policyMarket.active)?.effect === "positive",

  canActivateProtection: ({ context }: { context: GameState }) =>
    context.policyMarket.acquired.some((card) => card.name === "Strict protection") &&
    context.policyMarket.funding.length > 0,

  isExpansionActive: ({ context }: { context: GameState }) => context.config.useSpecialCards,

  shouldAutomaticallyDrawPolicy: ({ context }: { context: GameState }) =>
    context.turn.automaticPolicyDraw !== undefined,
};

export type ContextInjectedGuardMap = {
  [K in keyof typeof TurnMachineGuards]: (
    ...args: Tail<Parameters<(typeof TurnMachineGuards)[K]>>
  ) => ReturnType<(typeof TurnMachineGuards)[K]>;
};
