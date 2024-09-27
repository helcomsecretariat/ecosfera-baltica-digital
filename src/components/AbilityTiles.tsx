import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { abilityOffset } from "../constants/gameBoard";
import { useState } from "react";

const AbilityTiles = ({ xStart, rotation = [0, 0, 0] }: { xStart: number; rotation?: [number, number, number] }) => {
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
      position={[xStart, ability.y, 0]}
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
