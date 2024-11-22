import GameElement from "./GameElement";
import { tileSize } from "@/constants/gameBoard";
import { ExtinctionUID, HabitatUID } from "@/state/types";

import withMaterialProvider from "@/components/utils/withMaterialProvider";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";
import { getAssetPath } from "./utils";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";

const Tile = ({
  tileUid,
  type,
  name = "",
  onClick,
  withFloatAnimation = false,
  isAcquired,
}: {
  tileUid: ExtinctionUID | HabitatUID;
  type: "habitat" | "extinction";
  name?: string;
  onClick?: () => void;
  withFloatAnimation?: boolean;
  isAcquired: boolean;
}) => {
  const { RelevantMaterial } = useRelevantMaterial();
  const tileImageUrl = getAssetPath(
    "tile",
    type === "extinction" ? "extinction" : name === "" ? "default" : `${name}${isAcquired ? "_active" : ""}`,
  );
  const texture = useSRGBTexture(tileImageUrl);

  return (
    <GameElement cardUID={tileUid} height={6} width={10} onClick={onClick} withFloatAnimation={withFloatAnimation}>
      <cylinderGeometry args={[tileSize, tileSize, 0.1, 6, 1]} />
      <RelevantMaterial opacity={isAcquired ? 1 : 0.6} transparent map={texture} />
    </GameElement>
  );
};

export default withMaterialProvider(Tile);
