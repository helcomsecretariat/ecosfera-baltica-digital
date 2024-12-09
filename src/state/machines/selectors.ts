import { CardOrTileUID, GameState, HabitatUID, isHabitatUID } from "../types";
import { find, first, last } from "lodash";
import { TurnMachineGuards } from "./guards";
import { expansionStageEventText } from "./expansion";
import i18n from "@/i18n";

export const MachineSelectors = {
  selectPlayer: ({ context }: { context: GameState }) => find(context.players, { uid: context.turn.player })!,

  stageEventText: ({ context }: { context: GameState }) => {
    const player = MachineSelectors.selectPlayer({ context });
    const canRefresh = TurnMachineGuards.canRefreshAbility({ context });

    const getHabitatUnlockText = (uids: CardOrTileUID[]) => {
      const unlockedHabitats = uids
        .filter((uid) => isHabitatUID(uid))
        .map((uid: HabitatUID) => find(context.habitatMarket.deck, { uid })?.name);

      const habitatCount = unlockedHabitats.length;

      if (habitatCount === 0) return "";
      const habitatText =
        habitatCount === 1
          ? unlockedHabitats[0]
          : `${unlockedHabitats.slice(0, -1).join(", ")} and ${unlockedHabitats[habitatCount - 1]}`;

      return (
        i18n.t("stageEventText.congratulations") +
        "\n" +
        i18n.t("stageEventText.earnedHabitat", { habitatText, count: habitatCount })
      );
    };

    const getCardBoughtText = (uid: CardOrTileUID | undefined) => {
      if (!uid) {
        return "";
      }

      const cardName = find(player.hand, { uid })?.name;

      return i18n.t("stageEventText.congratulations") + "\n" + i18n.t("stageEventText.boughtCard", { cardName });
    };

    const lastRefreshedAbility = find(player.abilities, { uid: last(context.turn.refreshedAbilityUids) });
    const eventText = {
      disaster: i18n.t("stageEventText.disaster"),
      extinction: i18n.t("stageEventText.extinction"),
      massExtinction: i18n.t("stageEventText.massExtinction"),
      elementalDisaster: i18n.t("stageEventText.elementalDisaster"),
      abilityRefresh: !canRefresh
        ? i18n.t("stageEventText.abilityRefreshed", { abilityName: lastRefreshedAbility?.name ?? "" })
        : i18n.t("stageEventText.canRefreshAbility"),
      habitatUnlock: getHabitatUnlockText(context.stage?.effect ?? []),
      cardBuy: getCardBoughtText(first(context.stage?.effect ?? [])),
      gameWin: i18n.t("stageEventText.gameWin"),
      gameLoss: i18n.t("stageEventText.gameLoss"),
      ...expansionStageEventText,
      default: "",
    };

    return eventText[context.stage?.eventType ?? "default"];
  },

  isPositiveStageEvent: ({ context }: { context: GameState }) => context.stage?.outcome === "positive",

  usedAbilities: ({ context }: { context: GameState }) => {
    return context.turn.usedAbilities;
  },

  currentAbility: ({ context }: { context: GameState }) => {
    return context.turn.currentAbility;
  },

  exhaustedCards: ({ context: { turn } }: { context: GameState }) => turn.exhaustedCards,
};
