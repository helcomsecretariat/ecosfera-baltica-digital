import {
  hexagonTileXOffset,
  hexagonTileYOffset,
  extinctionTileYStart,
  hexagonTileXStart,
} from "../constants/gameBoard";
import HexagonTile from "./HexagonTile";

const ExtinctionTiles = () => {
  return [...Array.from(Array(7).keys())].map((x) => (
    <HexagonTile
      x={hexagonTileXStart + (x % 4) * hexagonTileXOffset}
      y={
        x <= 3
          ? extinctionTileYStart
          : extinctionTileYStart - hexagonTileYOffset
      }
      color="#8a6541"
    />
  ));
};

export default ExtinctionTiles;
