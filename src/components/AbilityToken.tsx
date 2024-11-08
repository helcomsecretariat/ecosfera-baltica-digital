import GameElement from "./GameElement";
import { AbilityTile as AbilityTileType } from "@/state/types";
import { useGameState } from "@/context/game-state/hook";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import withMaterialProvider from "@/components/utils/withMaterialProvider";

const AbilityToken = ({ ability, color }: { ability: AbilityTileType; color?: string }) => {
  const { emit } = useGameState();
  const { uiState } = useGameState();

  const plusTexture = useSRGBTexture("/ecosfera_baltica/ability_plus.avif");
  const refreshTexture = useSRGBTexture("/ecosfera_baltica/ability_refresh.avif");
  const moveTexture = useSRGBTexture("/ecosfera_baltica/ability_move.avif");

  return (
    <GameElement
      key={ability.uid}
      gamePieceAppearance={{
        ...uiState.cardPositions[ability.uid],
      }}
      height={6}
      width={6}
      onClick={emit.tokenClick(ability)}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial
        color={color ?? (ability.isUsed ? "#555" : "white")}
        map={ability.name === "move" ? moveTexture : ability.name === "plus" ? plusTexture : refreshTexture}
      />
    </GameElement>
  );
};

export default withMaterialProvider(AbilityToken);
