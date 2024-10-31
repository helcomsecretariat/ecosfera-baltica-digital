import GameElement from "@/components/GameElement";
import { getHighlightTextureAssetPath } from "@/components/utils";
import { abilityOffset } from "@/constants/gameBoard";
import { useGameState } from "@/context/game-state/provider";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { Coordinate } from "@/state/types";
import { useTexture } from "@react-three/drei";

type CardAbilityTilesProps = {
  xStart: number;
  yStart: number;
  rotation?: Coordinate;
};

const CardAbilityTiles = ({ xStart, yStart, rotation = { x: 0, y: 0, z: 0 } }: CardAbilityTilesProps) => {
  const { state, emit } = useGameState();
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

  return state.turn.selectedAbilityCard?.abilities.map((ability) => (
    <GameElement
      key={ability + xStart}
      gamePieceAppearance={{
        ...abilityTransforms[ability],
        delay: 0,
        duration: 0,
      }}
      height={6}
      width={6}
      onClick={emit.cardTokenClick(ability)}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial
        color="white"
        map={
          ability === "move"
            ? moveTexture
            : ability === "plus"
              ? plusTexture
              : ability === "special"
                ? specialTexture
                : refreshTexture
        }
      />
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#1D86BC" transparent map={highlightTexture} />
      </mesh>
    </GameElement>
  ));
};

export default CardAbilityTiles;
