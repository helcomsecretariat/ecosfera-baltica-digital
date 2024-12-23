import { CardOrTileUID, GameState, HabitatUID, isHabitatUID } from "../types";
import { find, first, last } from "lodash";
import { TurnMachineGuards } from "./guards";
import { expansionStageEventTextKeys } from "./expansion";
import i18n, { TranslatedString } from "@/i18n";

export const selectPlayer = ({ context }: { context: GameState }) =>
  find(context.players, { uid: context.turn.player })!;

export const selectStageEventText = ({ context }: { context: GameState }) => {
  const player = selectPlayer({ context });
  const canRefresh = TurnMachineGuards.canRefreshAbility({ context });

  const getHabitatUnlockText = (uids: CardOrTileUID[] | undefined) => {
    const unlockedHabitats = (uids ?? [])
      .filter((uid) => isHabitatUID(uid))
      .map((uid: HabitatUID) => find(context.habitatMarket.deck, { uid })?.name);

    const habitatCount = unlockedHabitats.length;

    if (habitatCount === 0) return [];
    const habitatText =
      habitatCount === 1
        ? unlockedHabitats[0]
        : `${unlockedHabitats.slice(0, -1).join(", ")} and ${unlockedHabitats[habitatCount - 1]}`;

    return [
      i18n.t("stageEventText.congratulations"),
      i18n.t("stageEventText.earnedHabitat", { habitatText, count: habitatCount }),
    ];
  };

  const getCardBoughtText = (uid: CardOrTileUID | undefined) => {
    const cardName = find(player.hand, { uid })?.name ?? "?";
    return [i18n.t("stageEventText.congratulations"), i18n.t("stageEventText.boughtCard", { cardName })];
  };

  const lastRefreshedAbility = find(player.abilities, { uid: last(context.turn.refreshedAbilityUids) });

  const translatedExpansionStageEventText = Object.entries(expansionStageEventTextKeys).reduce<
    Record<string, TranslatedString[]>
  >(
    (acc, [key, value]) => ({
      ...acc,
      [key]: Array.isArray(value) ? value.map((msgKey) => i18n.t(msgKey)) : [i18n.t(value)],
    }),
    {},
  );

  const eventText: Record<string, TranslatedString[]> = {
    disaster: [i18n.t("stageEventText.disaster")],
    extinction: [i18n.t("stageEventText.extinction")],
    massExtinction: [i18n.t("stageEventText.massExtinction")],
    elementalDisaster: [i18n.t("stageEventText.elementalDisaster")],
    abilityRefresh: !canRefresh
      ? [
          i18n.t("stageEventText.abilityRefreshed", { abilityName: lastRefreshedAbility?.name ?? "" }),
          i18n.t("stageEventText.canRefreshAbility"),
        ]
      : [i18n.t("stageEventText.canRefreshAbility")],
    habitatUnlock: getHabitatUnlockText(context.stage?.effect),
    cardBuy: getCardBoughtText(first(context.stage?.effect)),
    gameWin: [i18n.t("stageEventText.gameWin")],
    gameLoss: [i18n.t("stageEventText.gameLoss")],
    abilityUseBlocked: [i18n.t("stageEventText.abilityUseBlocked")],
    skipTurn: [i18n.t("stageEventText.skipTurn")],
    ...translatedExpansionStageEventText,
    default: [],
  };

  const texts = eventText[context.stage?.eventType ?? "default"];
  return texts.join("\n");
};

export const selectIsPositiveStageEvent = ({ context }: { context: GameState }) =>
  context.stage?.outcome === "positive";

export const selectUsedAbilities = ({ context }: { context: GameState }) => context.turn.usedAbilities;

export const selectCurrentAbility = ({ context }: { context: GameState }) => context.turn.currentAbility;

export const selectExhaustedCards = ({ context: { turn } }: { context: GameState }) => turn.exhaustedCards;

export const selectAllPlayerCards = ({ context: { players } }: { context: GameState }) =>
  players.flatMap((player) => [player.hand, player.deck, player.discard].flatMap((card) => card));

export const selectNumberOfAnimalsBought = ({ context }: { context: GameState }) =>
  selectAllPlayerCards({ context }).filter((card) => card.type === "animal").length;

export const selectNumberOfPlantsBought = ({ context }: { context: GameState }) =>
  selectAllPlayerCards({ context }).filter((card) => card.type === "plant").length;

export const selectNumberOfHabitatsUnlocked = ({ context: { habitatMarket } }: { context: GameState }) =>
  habitatMarket.deck.filter((habitat) => habitat.isAcquired).length;
