import { Coordinate } from "@/state/types";
import { hexagonTileXStart, biomeTileYStart, tileSize } from "../constants/gameBoard";
import Tile from "./Tile";

const biomes = ["Ice", "Coast", "Pelagic", "Rivers", "Soft bottom", "Hard benthic"];

const positions: Coordinate[] = [
  { x: hexagonTileXStart - tileSize, y: biomeTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart, y: biomeTileYStart, z: 0 },
  { x: hexagonTileXStart + tileSize, y: biomeTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart - tileSize, y: biomeTileYStart - tileSize * 1.68, z: 0 },
  { x: hexagonTileXStart, y: biomeTileYStart - tileSize * 2.25, z: 0 },
  { x: hexagonTileXStart + tileSize, y: biomeTileYStart - tileSize * 1.68, z: 0 },
];

const BiomeTiles = () => {
  return biomes.map((biome, index) => (
    <Tile
      key={biome}
      position={positions[index]}
      rotation={{ x: -Math.PI / 2, y: 0, z: 0 }}
      color="#66cc66"
      name={biome}
    />
  ));
};

export default BiomeTiles;
