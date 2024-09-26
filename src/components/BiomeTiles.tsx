import {
  hexagonTileXOffset,
  hexagonTileYOffset,
  hexagonTileXStart,
  biomeTileYStart,
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

const BiomeTiles = () => {
  return biomes.map((biome, index) => (
    <Tile
      key={biome}
      position={[
        hexagonTileXStart + (index % 4) * hexagonTileXOffset,
        index <= 3 ? biomeTileYStart : biomeTileYStart - hexagonTileYOffset,
        0,
      ]}
      rotation={[-1.57, ((Math.PI * 2) / 6) * index, 0]}
      color="#66cc66"
      name={biome}
    />
  ));
};

export default BiomeTiles;
