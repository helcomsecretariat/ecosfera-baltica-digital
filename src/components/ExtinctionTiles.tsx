import {
  extinctionTileYStart,
  hexagonTileXStart,
  tileSize,
} from "../constants/gameBoard";
import Tile from "./Tile";

const positions: [number, number, number][] = [
  [hexagonTileXStart - tileSize, extinctionTileYStart - tileSize * 0.55, 0],
  [hexagonTileXStart, extinctionTileYStart, 0],
  [hexagonTileXStart + tileSize, extinctionTileYStart - tileSize * 0.55, 0],
  [hexagonTileXStart - tileSize, extinctionTileYStart - tileSize * 1.68, 0],
  [hexagonTileXStart, extinctionTileYStart - tileSize * 2.25, 0],
  [hexagonTileXStart + tileSize, extinctionTileYStart - tileSize * 1.68, 0],
];

const ExtinctionTiles = () => {
  return [...Array.from(Array(6).keys())].map((_, index, { length }) => (
    <Tile
      key={index}
      position={positions[index]}
      rotation={[-1.57, ((Math.PI * 2) / length) * index, 0]}
      color="#c3b091"
    />
  ));
};

export default ExtinctionTiles;
