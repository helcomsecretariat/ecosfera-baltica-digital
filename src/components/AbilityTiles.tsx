import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { abilityOffset } from "../constants/gameBoard";
import { useState } from "react";
import { Coordinate } from "@/state/types";

const AbilityTiles = ({ xStart, rotation = { x: 0, y: 0, z: 0 } }: { xStart: number; rotation?: Coordinate }) => {
  const [abilities, setAbilities] = useState([
    {
      name: "move",
      y: 0,
      available: true,
    },
    {
      name: "refresh",
      y: 0 + abilityOffset,
      available: true,
    },
    {
      name: "plus",
      y: 0 - abilityOffset,
      available: true,
    },
  ]);

  return abilities.map((ability, index) => (
    <GameElement
      key={ability.name + xStart}
      position={{ x: xStart, y: ability.y, z: 0 }}
      rotation={rotation}
      height={6}
      width={6}
      onClick={() =>
        setAbilities(
          abilities.map((innerAbility, innerIndex) =>
            index === innerIndex ? { ...innerAbility, available: !innerAbility.available } : innerAbility,
          ),
        )
      }
      options={{ draggable: false }}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial color={ability.available ? "white" : "gray"} />
      <Text color="black" fontSize={2}>
        {ability.name === "move"
          ? "→"
          : ability.name === "plus"
            ? "+"
            : ability.name === "refresh"
              ? "↻"
              : ability.name === "special"
                ? "⚡"
                : ""}
      </Text>
    </GameElement>
  ));
};

export default AbilityTiles;
