import { tileSize, tileGridTransforms, hexagonTileXStart } from "@/constants/gameBoard";
import withMaterialProvider from "@/components/utils/withMaterialProvider";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";
import { getAssetPath } from "./utils";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { toVector3 } from "@/utils/3d";
import { useGameState } from "@/context/game-state/hook";

const CenterTile = withMaterialProvider(
  ({ yStart, tileType }: { yStart: number; tileType: "habitat" | "extinction" }) => {
    const { state } = useGameState();
    const { RelevantMaterial } = useRelevantMaterial();
    const tileImageUrl = getAssetPath("tile", tileType === "habitat" ? "baltic_active" : "extinction");
    const texture = useSRGBTexture(tileImageUrl);

    const showOnStage =
      (state.stage?.eventType === "gameLoss" && tileType === "extinction") ||
      (state.stage?.eventType === "gameWin" && tileType === "habitat");
    const transform = tileGridTransforms(
      showOnStage ? 0 : hexagonTileXStart,
      showOnStage ? 5 + tileSize : yStart,
      showOnStage ? 75 : 0,
    )[6];

    return (
      <mesh
        position={toVector3(transform?.position ?? { x: 0, y: 0, z: 0 })}
        rotation={toVector3(transform?.rotation ?? { x: 0, y: 0, z: 0 })}
      >
        <cylinderGeometry args={[tileSize, tileSize, 0.1, 6, 1]} />
        <RelevantMaterial map={texture} transparent />
      </mesh>
    );
  },
);

export default CenterTile;
