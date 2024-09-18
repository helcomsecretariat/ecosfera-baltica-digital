import { cardHeight, cardWidth } from "../constants/card";
import { Text } from "@react-three/drei";

const Deck = ({
  x,
  y,
  color,
  textColor = "white",
  name,
  onClick,
}: {
  x: number;
  y: number;
  color: string;
  textColor?: string;
  name: string;
  onClick: ({ x, y }: { x: number; y: number }) => void;
}) => {
  return (
    <mesh
      position={[x, y, 0]}
      onClick={() => {
        onClick({ x: x - 20, y });
      }}
    >
      <boxGeometry args={[cardWidth, cardHeight, 0]} />
      <meshBasicMaterial color={color} />
      <Text color={textColor} fontSize={2}>
        {name}
      </Text>
    </mesh>
  );
};

export default Deck;
