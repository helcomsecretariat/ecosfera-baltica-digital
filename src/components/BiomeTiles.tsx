import { Coordinate } from "@/state/types";
import { hexagonTileXStart, biomeTileYStart, tileSize } from "../constants/gameBoard";
import Tile from "./Tile";
import { useGameState } from "@/context/GameStateProvider";

const positions: Coordinate[] = [
  { x: hexagonTileXStart - tileSize, y: biomeTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart, y: biomeTileYStart, z: 0 },
  { x: hexagonTileXStart + tileSize, y: biomeTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart - tileSize, y: biomeTileYStart - tileSize * 1.68, z: 0 },
  { x: hexagonTileXStart, y: biomeTileYStart - tileSize * 2.25, z: 0 },
  { x: hexagonTileXStart + tileSize, y: biomeTileYStart - tileSize * 1.68, z: 0 },
];

const BiomeTiles = () => {
  const { handlers, state } = useGameState();

  return state.biomeMarket.deck.map((habitat, index) => (
    <Tile
      key={habitat.uid}
      position={positions[index]}
      rotation={{ x: -Math.PI / 2, y: 0, z: 0 }}
      color={habitat.isAcquired ? "#2cba16" : "#66cc66"}
      onClick={handlers.habitatClick(habitat)}
      name={habitat.name}
    />
  ));
};

export default BiomeTiles;
