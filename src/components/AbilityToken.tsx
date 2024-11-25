import GameElement from "./GameElement";
import { AbilityTile as AbilityTileType } from "@/state/types";
import { useGameState } from "@/context/game-state/hook";
import withMaterialProvider from "@/components/utils/withMaterialProvider";
import useAbilityTextures from "@/hooks/useAbilityTextures";

const AbilityToken = ({ ability, color }: { ability: AbilityTileType; color?: string }) => {
  const { emit } = useGameState();
  const { uiState } = useGameState();

  const abilityTextures = useAbilityTextures().fullSize;

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
      <meshBasicMaterial color={color ?? (ability.isUsed ? "#555" : "white")} map={abilityTextures[ability.name]} />
    </GameElement>
  );
};

export default withMaterialProvider(AbilityToken);
