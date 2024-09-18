import {
  hexagonTileXOffset,
  hexagonTileYOffset,
  hexagonTileXStart,
  biomeTileYStart,
} from "../constants/gameBoard";
import HexagonTile from "./HexagonTile";

const BiomeTiles = () => {
  return [...Array.from(Array(7).keys())].map((x) => (
    <HexagonTile
      x={hexagonTileXStart + (x % 4) * hexagonTileXOffset}
      y={x <= 3 ? biomeTileYStart : biomeTileYStart - hexagonTileYOffset}
      color="#2cba16"
    />
  ));
};

export default BiomeTiles;
