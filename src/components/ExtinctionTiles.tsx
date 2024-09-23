import {
  hexagonTileXOffset,
  hexagonTileYOffset,
  extinctionTileYStart,
  hexagonTileXStart,
} from "../constants/gameBoard";
import Tile from "./Tile";

const ExtinctionTiles = () => {
  return [...Array.from(Array(7).keys())].map((_, index, { length }) => (
    <Tile
      key={index}
      position={[
        hexagonTileXStart + (index % 4) * hexagonTileXOffset,
        index <= 3
          ? extinctionTileYStart
          : extinctionTileYStart - hexagonTileYOffset,
        0,
      ]}
      rotation={[-1.57, ((Math.PI * 2) / length) * index, 0]}
      color="#c3b091"
    />
  ));
};

export default ExtinctionTiles;
