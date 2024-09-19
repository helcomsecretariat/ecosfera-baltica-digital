import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { abilityOffset, playerCardsYStart } from "../constants/gameBoard";
import { cardHeight } from "../constants/card";
import { useState } from "react";

const AbilityTiles = () => {
  const [abilities, setAbilities] = useState([
    {
      name: "Move",
      x: 0 - abilityOffset,
      y: playerCardsYStart + cardHeight * 1.2,
      available: true,
    },
    {
      name: "Refresh",
      x: 0,
      y: playerCardsYStart + cardHeight * 1.2,
      available: true,
    },
    {
      name: "Plus",
      x: 0 + abilityOffset,
      y: playerCardsYStart + cardHeight * 1.2,
      available: true,
    },
  ]);

  return abilities.map((ability, index) => (
    <GameElement
      key={ability.name}
      position={[ability.x, ability.y, 0]}
      height={8}
      width={8}
      onClick={() =>
        setAbilities(
          abilities.map((innerAbility, innerIndex) =>
            index === innerIndex
              ? { ...innerAbility, available: !innerAbility.available }
              : innerAbility,
          ),
        )
      }
      options={{ draggable: false }}
    >
      <circleGeometry args={[4, 32]} />
      <meshBasicMaterial color={ability.available ? "white" : "gray"} />
      <Text color="black" fontSize={1.5}>
        {ability.name}
      </Text>
    </GameElement>
  ));
};

export default AbilityTiles;
