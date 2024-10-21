import { Button } from "@/components/ui/button";
import { upperXBoundary, lowerXBoundary, upperYBoundary, lowerYBoundary, abilityOffset } from "@/constants/gameBoard";
import { useGameState } from "@/context/GameStateProvider";
import { Html } from "@react-three/drei";
import AbilityTiles from "./AbilityTiles";
import { cardWidth } from "@/constants/card";
import { find } from "lodash";
import { motion } from "framer-motion-3d";

const Stage = () => {
  const { handlers, state } = useGameState();
  const eventName = {
    disaster: "Disaster!",
    extinction: "Extinction!",
    massExtinction: "Mass extinction!",
    elementalDisaster: "Elemental disaster!",
    abilityRefresh: "Ability refresh!",
  };

  return (
    state.stage !== undefined && (
      <motion.group>
        <mesh position={[0, 0, 40]}>
          <planeGeometry args={[upperXBoundary - lowerXBoundary, upperYBoundary - lowerYBoundary, 1]} />
          <meshPhysicalMaterial transparent opacity={0.6} transmission={0.1} color="indigo" />
        </mesh>
        {state.stage.eventType === "abilityRefresh" && (
          <AbilityTiles
            canRefresh={true}
            xStart={0 - cardWidth}
            yStart={0 - abilityOffset}
            zStart={50}
            abilities={find(state.players, { uid: state.turn.player })!.abilities.filter((ability) => ability.isUsed)}
          />
        )}
        <Html wrapperClass="top-10" position={[0, -35, 0]} transform scale={8}>
          <h1 className="mb-8 text-center text-2xl text-white">{eventName[state.stage.eventType]}</h1>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handlers.stageConfirm()();
            }}
            variant="default"
            className="w-full"
          >
            Ok
          </Button>
        </Html>
      </motion.group>
    )
  );
};

export default Stage;
