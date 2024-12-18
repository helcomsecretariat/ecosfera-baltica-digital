import { tileSize, tileGridTransforms, hexagonTileXStart } from "@/constants/gameBoard";
import withMaterialProvider from "@/components/utils/withMaterialProvider";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";
import { getAssetPath } from "./utils";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { toVector3 } from "@/utils/3d";

const CenterTile = withMaterialProvider(
  ({ texturePathSuffix, yStart }: { texturePathSuffix: string; yStart: number }) => {
    const { RelevantMaterial } = useRelevantMaterial();
    const tileImageUrl = getAssetPath("tile", texturePathSuffix);
    const texture = useSRGBTexture(tileImageUrl);
    const transform = tileGridTransforms(hexagonTileXStart, yStart)[6];

    return (
      <mesh
        position={toVector3(transform?.position ?? { x: 0, y: 0, z: 0 })}
        rotation={toVector3(transform?.rotation ?? { x: 0, y: 0, z: 0 })}
      >
        <cylinderGeometry args={[tileSize, tileSize, 0.1, 6, 1]} />
        <RelevantMaterial map={texture} />
      </mesh>
    );
  },
);

export default CenterTile;
