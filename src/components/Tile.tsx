import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { tileSize } from "@/constants/gameBoard";
import { Coordinate } from "@/state/types";
import { deckAnimationTimings } from "@/constants/animation";

const Tile = ({
  position,
  rotation = { x: -Math.PI / 2, y: 0, z: 0 },
  color,
  name = "",
  onClick,
  opacity = 1,
}: {
  position: Coordinate;
  rotation?: Coordinate;
  color: string;
  name?: string;
  onClick?: () => void;
  opacity?: number;
}) => {
  return (
    <GameElement
      gamePieceAppearance={{
        transform: {
          initialPosition: position,
          initialRotation: rotation,
          position,
          rotation,
        },
        ...deckAnimationTimings,
      }}
      height={6}
      width={10}
      onClick={onClick}
    >
      <cylinderGeometry args={[tileSize, tileSize, 0.1, 6, 1]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
      <Text fontSize={1} color="black" rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        {name}
      </Text>
    </GameElement>
  );
};

export default Tile;
