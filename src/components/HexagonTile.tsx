import { Text } from "@react-three/drei";
import GameElement from "./GameElement";

const HexagonTile = ({
  x,
  y,
  color,
  name = "",
}: {
  x: number;
  y: number;
  color: string;
  name?: string;
}) => {
  return (
    <GameElement
      position={[x, y, 0]}
      rotation={[-1.57, 0, 0]}
      height={6}
      width={10}
    >
      <cylinderGeometry args={[5, 5, 0.1, 6, 1]} />
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

export default HexagonTile;