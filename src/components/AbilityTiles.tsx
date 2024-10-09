import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { abilityOffset } from "../constants/gameBoard";
import { AbilityTile, Coordinate } from "@/state/types";
import { useGameState } from "@/context/GameStateProvider";

const AbilityTiles = ({
  xStart,
  yStart,
  rotation = { x: 0, y: 0, z: 0 },
  abilities,
}: {
  xStart: number;
  yStart: number;
  rotation?: Coordinate;
  abilities: AbilityTile[];
}) => {
  const { handlers } = useGameState();

  return abilities.map((ability, index) => (
    <GameElement
      key={ability.name + xStart}
      gamePieceAppearance={{
        transform: {
          position: { x: xStart, y: yStart + abilityOffset * index, z: 0 },
          rotation,
        },
      }}
      height={6}
      width={6}
      onClick={handlers.tokenClick(ability)}
      options={{ draggable: false }}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial color={ability.isUsed ? "gray" : "white"} />
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
