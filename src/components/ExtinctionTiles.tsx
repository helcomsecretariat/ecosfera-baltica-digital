import { Coordinate, GameState } from "@/state/types";
import { extinctionTileYStart, hexagonTileXStart, tileSize } from "../constants/gameBoard";
import Tile from "./Tile";
import { concat } from "lodash";

const positions: Coordinate[] = [
  { x: hexagonTileXStart - tileSize, y: extinctionTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart, y: extinctionTileYStart, z: 0 },
  { x: hexagonTileXStart + tileSize, y: extinctionTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart - tileSize, y: extinctionTileYStart - tileSize * 1.68, z: 0 },
  { x: hexagonTileXStart, y: extinctionTileYStart - tileSize * 2.25, z: 0 },
  { x: hexagonTileXStart + tileSize, y: extinctionTileYStart - tileSize * 1.68, z: 0 },
];

const ExtinctionTiles = ({ gameState }: { gameState: GameState }) => {
  return concat(gameState.extinctMarket.deck, gameState.extinctMarket.table).map((extinctTile, index, { length }) => {
    return (
      <Tile
        key={index}
        position={positions[index]}
        rotation={{ x: -1.57, y: ((Math.PI * 2) / length) * index, z: 0 }}
        color={gameState.extinctMarket.deck.includes(extinctTile) ? "#c3b091" : "#d17b79"}
      />
    );
  });
};

export default ExtinctionTiles;
