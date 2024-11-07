import { CardOrTileUID, GameState, HabitatUID, isHabitatUID, StageEventType } from "../types";
import { find, first, last } from "lodash";
import { TurnMachineGuards } from "./guards";

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

      return `Congratulations!\nYou earned the ${habitatText} ${habitatCount > 1 ? "habitats" : "habitat"}`;
    };

    const getCardBoughtText = (uid: CardOrTileUID | undefined) => {
      if (!uid) {
        return "";
      }

      const cardName = find(player.hand, { uid })?.name;

      return `Congratulations!\nYou bought a ${cardName}`;
    };

    const lastRefreshedAbility = find(player.abilities, { uid: last(context.turn.refreshedAbilityUids) });
    const eventText = {
      disaster: "You did not buy anything.\nYou get a disaster card.",
      extinction: "Too many disasters causes an extinction.\nYou get an extinction tile.",
      massExtinction: "Too many disasters causes a mass extinction.\nYou get 3 extinction tiles.",
      elementalDisaster: "Too many elements causes a disaster.\nYou get a disaster card.",
      abilityRefresh: !canRefresh
        ? `Your ${lastRefreshedAbility?.name ?? ""} ability has been refreshed!`
        : "You can now refresh one of your used abilities.",
      habitatUnlock: getHabitatUnlockText(context.stage?.effect ?? []),
      cardBuy: getCardBoughtText(first(context.stage?.cause ?? [])),
      gameWin: "Congratulations!\nYou saved the Baltic ecosystem!",
      gameLoss: "Game Over!\nYou could not save the Baltic Ecosystem.",
      default: "",
    };

    return eventText[context.stage?.eventType ?? "default"];
  },

  isPositiveStageEvent: ({ context }: { context: GameState }) =>
    (
      ({
        disaster: false,
        elementalDisaster: false,
        extinction: false,
        massExtinction: false,
        abilityRefresh: true,
        habitatUnlock: true,
        cardBuy: true,
        gameLoss: false,
        gameWin: true,
      }) as Record<StageEventType, boolean>
    )[context.stage?.eventType ?? "disaster"],
};
