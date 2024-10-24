import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { tileSize } from "@/constants/gameBoard";
import { ExtinctionUID, HabitatUID } from "@/state/types";

const Tile = ({
  tileUid,
  color,
  name = "",
  onClick,
  opacity = 1,
}: {
  tileUid: ExtinctionUID | HabitatUID;
  color: string;
  name?: string;
  onClick?: () => void;
  opacity?: number;
}) => {
  return (
    <GameElement cardUID={tileUid} height={6} width={10} onClick={onClick}>
      <cylinderGeometry args={[tileSize, tileSize, 0.1, 6, 1]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
      <Text fontSize={1} color="black" rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0.1]}>
        {name}
      </Text>
    </GameElement>
  );
};

export default Tile;
