import GameElement from "./GameElement";
import { abilityOffset } from "../constants/gameBoard";
import { AbilityTile, Coordinate } from "@/state/types";
import { useGameState } from "@/context/GameStateProvider";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useTexture } from "@react-three/drei";
import { getHighlightTextureAssetPath } from "./utils";

const AbilityTiles = ({
  xStart,
  yStart,
  rotation = { x: 0, y: 0, z: 0 },
  abilities,
  canRefresh,
  highlight,
}: {
  xStart: number;
  yStart: number;
  rotation?: Coordinate;
  abilities: AbilityTile[];
  canRefresh: boolean;
  highlight?: boolean;
}) => {
  const { handlers } = useGameState();
  const highlightTexture = useTexture(getHighlightTextureAssetPath(true));
  const plusTexture = useSRGBTexture("/ecosfera_baltica/ability_plus.avif");
  const refreshTexture = useSRGBTexture("/ecosfera_baltica/ability_refresh.avif");
  const specialTexture = useSRGBTexture("/ecosfera_baltica/ability_special.avif");
  const moveTexture = useSRGBTexture("/ecosfera_baltica/ability_move.avif");

  const abilityTransforms = {
    move: {
      initialPosition: { x: xStart, y: yStart, z: 0 },
      initialRotation: rotation,
      position: { x: xStart, y: yStart, z: 0 },
      rotation,
    },
    plus: {
      initialPosition: { x: xStart, y: yStart + abilityOffset, z: 0 },
      initialRotation: rotation,
      position: { x: xStart, y: yStart + abilityOffset, z: 0 },
      rotation,
    },
    refresh: {
      initialPosition: { x: xStart, y: yStart + abilityOffset * 2, z: 0 },
      initialRotation: rotation,
      position: { x: xStart, y: yStart + abilityOffset * 2, z: 0 },
      rotation,
    },
    special: {
      initialPosition: { x: xStart - abilityOffset, y: yStart + abilityOffset, z: 0 },
      initialRotation: rotation,
      position: { x: xStart - abilityOffset, y: yStart + abilityOffset, z: 0 },
      rotation,
    },
  };

  return abilities.map((ability) => (
    <GameElement
      key={ability.name + xStart}
      gamePieceAppearance={{
        transform: abilityTransforms[ability.name],
        delay: 0,
        duration: 0,
      }}
      height={6}
      width={6}
      onClick={handlers.tokenClick(ability)}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial
        color={ability.isUsed ? (canRefresh ? "green" : "#555") : "white"}
        map={
          ability.name === "move"
            ? moveTexture
            : ability.name === "plus"
              ? plusTexture
              : ability.name === "special"
                ? specialTexture
                : refreshTexture
        }
      />
      {highlight && (
        <mesh position={[0, 0, -0.1]}>
          <circleGeometry args={[5, 32]} />
          <meshBasicMaterial color="#1D86BC" transparent map={highlightTexture} />
        </mesh>
      )}
    </GameElement>
  ));
};

export default AbilityTiles;
