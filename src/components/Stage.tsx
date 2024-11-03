import { Button } from "@/components/ui/button";
import { upperXBoundary, lowerXBoundary, upperYBoundary, lowerYBoundary } from "@/constants/gameBoard";
import { useGameState } from "@/context/game-state/hook";
import { Html } from "@react-three/drei";
import { cardHeight } from "@/constants/card";
import { difference, find, last } from "lodash";
import { motion } from "framer-motion-3d";
import { getAssetPath } from "./utils";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { DisasterUID, ExtinctionUID, GameState, HabitatUID, isHabitatUID } from "@/state/types";
import { TurnMachineGuards } from "@/state/machines/guards";

const getHabitatUnlockText = (state: GameState, uids: (HabitatUID | DisasterUID | ExtinctionUID)[]) => {
  const unlockedHabitats = uids
    .filter((uid) => isHabitatUID(uid))
    .map((uid: HabitatUID) => find(state.habitatMarket.deck, { uid })?.name);

  const habitatCount = unlockedHabitats.length;

  if (habitatCount === 0) return "";
  const habitatText =
    habitatCount === 1
      ? unlockedHabitats[0]
      : `${unlockedHabitats.slice(0, -1).join(", ")} and ${unlockedHabitats[habitatCount - 1]}`;

  return `Congratulations!\nYou earned the ${habitatText} ${habitatCount > 1 ? "habitats" : "habitat"}`;
};

const Stage = () => {
  const { emit, state, snap } = useGameState();
  const player = find(state.players, { uid: state.turn.player })!;
  const canRefresh = TurnMachineGuards.canRefreshAbility({ context: state });
  const isPositive =
    snap.matches({ stagingEvent: "abilityRefresh" }) ||
    snap.matches({ stagingEvent: "habitatUnlock" }) ||
    snap.matches({ stagingEvent: "gameWon" });
  const lastRefreshedAbility = find(player.abilities, { uid: last(state.turn.refreshedAbilityUids) });
  const positiveTextureImageUrl = getAssetPath("stage", "positive");
  const negativeTextureImageUrl = getAssetPath("stage", "negative");
  const positiveTexture = useSRGBTexture(positiveTextureImageUrl);
  const negativeTexture = useSRGBTexture(negativeTextureImageUrl);

  const eventName = {
    disaster: "You did not buy anything.\nYou get a disaster card.",
    extinction: "Too many disasters causes an extinction.\nYou get an extinction tile.",
    massExtinction: "Too many disasters causes a mass extinction.\nYou get 3 extinction tiles.",
    elementalDisaster: "Too many elements causes a disaster.\nYou get a disaster card.",
    abilityRefresh: !canRefresh
      ? `Your ${lastRefreshedAbility?.name ?? ""} ability has been refreshed!`
      : "You can now refresh one of your used abilities.",
    habitatUnlock: getHabitatUnlockText(state, state.stage?.effect ?? []),
    gameWin: "Congratulations!\nYou saved the Baltic ecosystem!",
    gameLoss: "Game Over!\nYou could not save the Baltic Ecosystem.",
  };

  return (
    state.stage !== undefined && (
      <motion.group>
        <mesh position={[0, 0, 20]}>
          <planeGeometry args={[upperXBoundary - lowerXBoundary + 5, upperYBoundary - lowerYBoundary, 1]} />
          <meshPhysicalMaterial
            transparent
            opacity={state.stage.terminationEvent ? 1 : 0.7}
            map={isPositive ? positiveTexture : negativeTexture}
          />
        </mesh>
        <Html wrapperClass="top-10" position={[0, -2.5 * cardHeight, 0]} transform scale={8}>
          <h1 className="mb-8 whitespace-pre-wrap text-center text-xl text-white">
            {eventName[state.stage.eventType]}
          </h1>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (state.stage?.terminationEvent) {
                window.location.reload();
                return;
              }
              emit.stageConfirm()();
            }}
            disabled={
              state.stage.eventType === "abilityRefresh" &&
              difference(state.stage.cause, state.turn.uidsUsedForAbilityRefresh).length !== 0
            }
            variant="default"
            className="w-full"
          >
            {state.stage.terminationEvent ? "New game" : "Ok"}
          </Button>
        </Html>
      </motion.group>
    )
  );
};

export default Stage;
