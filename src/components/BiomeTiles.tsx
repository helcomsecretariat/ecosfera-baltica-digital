import {
  hexagonTileXStart,
  biomeTileYStart,
  tileSize,
} from "../constants/gameBoard";
import Tile from "./Tile";

const biomes = [
  "Ice",
  "Coast",
  "Pelagic",
  "Rivers",
  "Soft bottom",
  "Hard benthic",
];

const positions: [number, number, number][] = [
  [hexagonTileXStart - tileSize, biomeTileYStart - tileSize * 0.55, 0],
  [hexagonTileXStart, biomeTileYStart, 0],
  [hexagonTileXStart + tileSize, biomeTileYStart - tileSize * 0.55, 0],
  [hexagonTileXStart - tileSize, biomeTileYStart - tileSize * 1.68, 0],
  [hexagonTileXStart, biomeTileYStart - tileSize * 2.25, 0],
  [hexagonTileXStart + tileSize, biomeTileYStart - tileSize * 1.68, 0],
];

const BiomeTiles = () => {
  return biomes.map((biome, index) => (
    <Tile
      key={biome}
      position={positions[index]}
      rotation={[-1.57, ((Math.PI * 2) / 6) * index, 0]}
      color="#66cc66"
      name={biome}
    />
  ));
};

export default BiomeTiles;
