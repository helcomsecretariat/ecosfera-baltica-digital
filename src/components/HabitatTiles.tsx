import { Coordinate } from "@/state/types";
import { hexagonTileXStart, habitatTileYStart, tileSize } from "../constants/gameBoard";
import Tile from "./Tile";
import { useGameState } from "@/context/GameStateProvider";

const positions: Coordinate[] = [
  { x: hexagonTileXStart - tileSize, y: habitatTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart, y: habitatTileYStart, z: 0 },
  { x: hexagonTileXStart + tileSize, y: habitatTileYStart - tileSize * 0.55, z: 0 },
  { x: hexagonTileXStart - tileSize, y: habitatTileYStart - tileSize * 1.68, z: 0 },
  { x: hexagonTileXStart, y: habitatTileYStart - tileSize * 2.25, z: 0 },
  { x: hexagonTileXStart + tileSize, y: habitatTileYStart - tileSize * 1.68, z: 0 },
];

const HabitatTiles = () => {
  const { state } = useGameState();

  return state.habitatMarket.deck.map((habitat, index) => (
    <Tile
      key={habitat.uid}
      position={positions[index]}
      color={habitat.isAcquired ? "#2cba16" : "#66cc66"}
      name={habitat.name}
    />
  ));
};

export default HabitatTiles;
