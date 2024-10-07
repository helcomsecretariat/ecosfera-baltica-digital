import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { abilityOffset } from "../constants/gameBoard";
import { AbilityTile, Coordinate } from "@/state/types";
import { useGameState } from "@/context/GameStateProvider";

const AbilityTiles = ({
  xStart,
  rotation = { x: 0, y: 0, z: 0 },
  abilities,
}: {
  xStart: number;
  rotation?: Coordinate;
  abilities: AbilityTile[];
}) => {
  // const [abilities, setAbilities] = useState([
  //   {
  //     name: "move",
  //     y: 0,
  //     available: true,
  //   },
  //   {
  //     name: "refresh",
  //     y: 0 + abilityOffset,
  //     available: true,
  //   },
  //   {
  //     name: "plus",
  //     y: 0 - abilityOffset,
  //     available: true,
  //   },
  // ]);

  const { handlers } = useGameState();

  return abilities.map((ability, index) => (
    <GameElement
      key={ability.name + xStart}
      position={{ x: xStart, y: abilityOffset * index, z: 0 }}
      rotation={rotation}
      height={6}
      width={6}
      onClick={handlers.tokenClick(ability)}
      options={{ draggable: false }}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial color={ability.is_used ? "white" : "gray"} />
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
