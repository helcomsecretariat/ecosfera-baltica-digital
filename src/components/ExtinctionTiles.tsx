import {
  hexagonTileXOffset,
  hexagonTileYOffset,
  extinctionTileYStart,
  hexagonTileXStart,
} from "../constants/gameBoard";
import HexagonTile from "./HexagonTile";

const ExtinctionTiles = () => {
  return [...Array.from(Array(7).keys())].map((index) => (
    <HexagonTile
      key={index}
      position={[
        hexagonTileXStart + (index % 4) * hexagonTileXOffset,
        index <= 3
          ? extinctionTileYStart
          : extinctionTileYStart - hexagonTileYOffset,
        0,
      ]}
      color="#8a6541"
    />
  ));
};

export default ExtinctionTiles;
