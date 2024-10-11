import GameElement from "./GameElement";
import { abilityOffset } from "../constants/gameBoard";
import { AbilityTile, Coordinate } from "@/state/types";
import { useGameState } from "@/context/GameStateProvider";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";

const AbilityTiles = ({
  xStart,
  yStart,
  rotation = { x: 0, y: 0, z: 0 },
  abilities,
}: {
  xStart: number;
  yStart: number;
  rotation?: Coordinate;
  abilities: AbilityTile[];
}) => {
  const { handlers } = useGameState();
  const plusTexture = useSRGBTexture("/ecosfera_baltica/ability_plus.avif");
  const refreshTexture = useSRGBTexture("/ecosfera_baltica/ability_refresh.avif");
  const moveTexture = useSRGBTexture("/ecosfera_baltica/ability_move.avif");

  return abilities.map((ability, index) => (
    <GameElement
      key={ability.name + xStart}
      gamePieceAppearance={{
        transform: {
          initialPosition: { x: xStart, y: yStart + abilityOffset * index, z: 0 },
          initialRotation: rotation,
          position: { x: xStart, y: yStart + abilityOffset * index, z: 0 },
          rotation,
        },
        delay: 0,
        duration: 0,
      }}
      height={6}
      width={6}
      onClick={handlers.tokenClick(ability)}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial
        color={ability.isUsed ? "#555" : "white"}
        map={ability.name === "move" ? moveTexture : ability.name === "plus" ? plusTexture : refreshTexture}
      />
    </GameElement>
  ));
};

export default AbilityTiles;
