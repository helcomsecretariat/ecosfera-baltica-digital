import {
  hexagonTileXOffset,
  hexagonTileYOffset,
  hexagonTileXStart,
  biomeTileYStart,
} from "../constants/gameBoard";
import HexagonTile from "./HexagonTile";

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
    <HexagonTile
      key={biome}
      position={[
        hexagonTileXStart + (index % 4) * hexagonTileXOffset,
        index <= 3 ? biomeTileYStart : biomeTileYStart - hexagonTileYOffset,
        0,
      ]}
      color="#2cba16"
      name={biome}
    />
  ));
};

export default BiomeTiles;
