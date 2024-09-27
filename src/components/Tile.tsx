import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { tileSize } from "@/constants/gameBoard";

const Tile = ({
  position,
  rotation = [0, 0, 0],
  color,
  name = "",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  name?: string;
}) => {
  return (
    <GameElement position={position} rotation={rotation} height={6} width={10}>
      <cylinderGeometry args={[tileSize, tileSize, 0.1, 3, 1]} />
      <meshBasicMaterial color={color} />
      <Text
        fontSize={1}
        color="black"
        rotation={[1.57, 0, 0]}
        position={[0, -0.1, 0]}
      >
        {name}
      </Text>
    </GameElement>
  );
};

export default Tile;
