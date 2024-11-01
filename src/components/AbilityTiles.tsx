import GameElement from "./GameElement";
import { abilityOffset } from "../constants/gameBoard";
import { AbilityTile, Coordinate } from "@/state/types";
import { useGameState } from "@/context/game-state/hook";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useTexture } from "@react-three/drei";
import { getHighlightTextureAssetPath } from "./utils";

const AbilityTiles = ({
  xStart,
  yStart,
  zStart = 0,
  rotation = { x: 0, y: 0, z: 0 },
  abilities,
  canRefresh,
  isClickable,
  orientation = "vertical",
}: {
  xStart: number;
  yStart: number;
  zStart?: number;
  rotation?: Coordinate;
  abilities: AbilityTile[];
  canRefresh: boolean;
  isClickable: boolean;
  orientation?: "horizontal" | "vertical";
}) => {
  const { emit, state } = useGameState();
  const plusTexture = useSRGBTexture("/ecosfera_baltica/ability_plus.avif");
  const refreshTexture = useSRGBTexture("/ecosfera_baltica/ability_refresh.avif");
  const moveTexture = useSRGBTexture("/ecosfera_baltica/ability_move.avif");
  const highlightTexture = useTexture(getHighlightTextureAssetPath(true));

  return abilities.map((ability, index) => (
    <GameElement
      key={ability.name + xStart}
      gamePieceAppearance={{
        initialPosition:
          orientation === "vertical"
            ? { x: xStart, y: yStart + abilityOffset * index, z: zStart }
            : { x: xStart + abilityOffset * index, y: yStart, z: zStart },
        initialRotation: rotation,
        position:
          orientation === "vertical"
            ? { x: xStart, y: yStart + abilityOffset * index, z: zStart }
            : { x: xStart + abilityOffset * index, y: yStart, z: zStart },
        rotation,
        delay: 0,
        duration: 0,
      }}
      height={6}
      width={6}
      onClick={isClickable ? emit.tokenClick(ability) : undefined}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial
        color={ability.isUsed ? (canRefresh ? "white" : "#555") : "white"}
        map={ability.name === "move" ? moveTexture : ability.name === "plus" ? plusTexture : refreshTexture}
      />
      {state.turn.currentAbility?.piece === ability && (
        <mesh position={[0, 0, -0.1]}>
          <circleGeometry args={[5, 32]} />
          <meshBasicMaterial color="#1D86BC" transparent map={highlightTexture} />
        </mesh>
      )}
    </GameElement>
  ));
};

export default AbilityTiles;
