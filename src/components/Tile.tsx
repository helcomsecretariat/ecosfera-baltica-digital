import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { tileSize } from "@/constants/gameBoard";
import { Coordinate } from "@/state/types";

const Tile = ({
  position,
  rotation = { x: 0, y: 0, z: 0 },
  color,
  name = "",
  onClick,
}: {
  position: Coordinate;
  rotation?: Coordinate;
  color: string;
  name?: string;
  onClick?: () => void;
}) => {
  return (
    <GameElement position={position} rotation={rotation} height={6} width={10} onClick={onClick}>
      <cylinderGeometry args={[tileSize, tileSize, 0.1, 6, 1]} />
      <meshBasicMaterial color={color} />
      <Text fontSize={1} color="black" rotation={[1.57, 0, 0]} position={[0, -0.1, 0]}>
        {name}
      </Text>
    </GameElement>
  );
};

export default Tile;
