import { cardHeight, cardWidth } from "../constants/card";
import GameElement from "./GameElement";
import { Card, GamePieceAppearance } from "@/state/types";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useTexture } from "@react-three/drei";
import { getHighlightTextureAssetPath } from "./utils";

const Deck = ({
  gamePieceAppearance,
  texturePath = "/ecosfera_baltica/back.avif",
  onClick,
  cards,
  isDimmed = false,
  isHighlighted = false,
}: {
  gamePieceAppearance: GamePieceAppearance;
  texturePath?: string;
  textColor?: string;
  onClick: () => void;
  cards: Card[];
  isDimmed?: boolean;
  isHighlighted?: boolean;
  options?: { shuffleable: boolean };
}) => {
  const texture = useSRGBTexture(texturePath);
  const highlightTexture = useTexture(getHighlightTextureAssetPath());
  const deckDepth = 0.1 * cards.length;
  const textPosition: [number, number, number] = [
    -cardWidth / 2 + cardWidth * 0.15,
    cardHeight / 2 - cardHeight * 0.11,
    deckDepth + 0.15,
  ];

  return (
    <>
      <GameElement
        gamePieceAppearance={gamePieceAppearance}
        height={cardHeight}
        width={cardWidth}
        onClick={() => (isDimmed ? null : onClick())}
      >
        {isHighlighted && (
          <mesh>
            <RoundedRectangleGeometry args={[cardWidth + 8, cardHeight + 8, 1.5, 0.01]} />
            <meshBasicMaterial transparent={true} attach="material-0" map={highlightTexture} />
            <meshBasicMaterial transparent={true} opacity={0} attach="material-1" />
          </mesh>
        )}
        <mesh>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, 1.5, deckDepth]} />
          <meshBasicMaterial attach="material-0" map={texture} color={isDimmed ? "#999" : "white"} />
          <meshBasicMaterial attach="material-1" />
        </mesh>
        <mesh position={textPosition}>
          <circleGeometry args={[1.5, 16]} />
          <meshBasicMaterial color="white" opacity={isDimmed ? 0.2 : 0.5} transparent />
        </mesh>
        <TextWithShadow textAlign="center" fontSize={2} position={textPosition} opacity={0.5}>
          {cards.length}
        </TextWithShadow>

        {/* {isDimmed && (
          <mesh>
            <RoundedRectangleGeometry args={[cardWidth + 0.1, cardHeight + 0.1, 1.5, deckDepth + 0.3]} />
            <meshBasicMaterial color="black" transparent opacity={0.6} />
          </mesh>
        )} */}
      </GameElement>
    </>
  );
};

export default Deck;
