import {
  hexagonTileXOffset,
  hexagonTileYOffset,
  extinctionTileYStart,
  hexagonTileXStart,
} from "../constants/gameBoard";
import Tile from "./Tile";

const ExtinctionTiles = () => {
  return [...Array.from(Array(7).keys())].map((index) => (
    <Tile
      key={index}
      position={[
        hexagonTileXStart + (index % 4) * hexagonTileXOffset,
        index <= 3
          ? extinctionTileYStart
          : extinctionTileYStart - hexagonTileYOffset,
        0,
      ]}
      rotation={[-1.57, 1.04*index, 0]}
      color="#8a6541"
    />
  ));
};

export default ExtinctionTiles;
