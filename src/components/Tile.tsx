import { Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { tileSize } from "@/constants/gameBoard";
import { ExtinctionUID, HabitatUID } from "@/state/types";

import withMaterialProvider from "@/components/utils/withMaterialProvider";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";

const Tile = ({
  tileUid,
  color,
  name = "",
  onClick,
  opacity = 1,
  withFloatAnimation = false,
}: {
  tileUid: ExtinctionUID | HabitatUID;
  color: string;
  name?: string;
  onClick?: () => void;
  opacity?: number;
  withFloatAnimation?: boolean;
}) => {
  const { RelevantMaterial } = useRelevantMaterial();

  return (
    <GameElement cardUID={tileUid} height={6} width={10} onClick={onClick} withFloatAnimation={withFloatAnimation}>
      <cylinderGeometry args={[tileSize, tileSize, 0.1, 6, 1]} />
      <RelevantMaterial color={color} opacity={opacity} transparent />
      <Text fontSize={1} color="black" rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0.1]}>
        {name}
      </Text>
    </GameElement>
  );
};

export default withMaterialProvider(Tile);
