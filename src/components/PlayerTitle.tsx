import GameElement from "@/components/GameElement";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { GamePieceAppearance } from "@/state/types";

const PlayerTitle = ({
  text,
  gamePieceAppearance,
  offset,
}: {
  text: string;
  gamePieceAppearance: GamePieceAppearance;
  offset: [number, number, number];
}) => (
  <GameElement gamePieceAppearance={gamePieceAppearance}>
    <TextWithShadow
      position={offset}
      fontSize={2}
      color="#FBF6E3"
      shadowColor="white"
      anchorX="center"
      anchorY="bottom"
      textAlign="left"
    >
      {/* removing wierd space due to emoji */}
      {text}
    </TextWithShadow>
  </GameElement>
);

export default PlayerTitle;
