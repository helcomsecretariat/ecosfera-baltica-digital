import { Coordinate } from "@/state/types";
import { extinctionTileYStart, hexagonTileXStart, tileSize } from "../constants/gameBoard";
import Tile from "./Tile";

const positions: Coordinate[] = [
  { x: hexagonTileXStart - tileSize, y: extinctionTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart, y: extinctionTileYStart, z: 0 },
  { x: hexagonTileXStart + tileSize, y: extinctionTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart - tileSize, y: extinctionTileYStart - tileSize * 1.68, z: 0 },
  { x: hexagonTileXStart, y: extinctionTileYStart - tileSize * 2.25, z: 0 },
  { x: hexagonTileXStart + tileSize, y: extinctionTileYStart - tileSize * 1.68, z: 0 },
];

const ExtinctionTiles = () => {
  return [...Array.from(Array(6).keys())].map((_, index, { length }) => (
    <Tile
      key={index}
      position={positions[index]}
      rotation={{ x: -1.57, y: ((Math.PI * 2) / length) * index, z: 0 }}
      color="#c3b091"
    />
  ));
};

export default ExtinctionTiles;
