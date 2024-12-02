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
      fontSize={2.1}
      strokeColor="#ffffff"
      outlineBlur={0}
      anchorX="center"
      anchorY="bottom"
      textAlign="left"
    >
      {text}
    </TextWithShadow>
  </GameElement>
);

export default PlayerTitle;
