import { cardHeight, cardWidth, cardRadius } from "../constants/card";
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
  const deckDepth = 0.1 * (1 + cards.length);
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
            <RoundedRectangleGeometry args={[cardWidth + 8, cardHeight + 8, cardRadius, 0.01]} />
            <meshBasicMaterial transparent={true} map={highlightTexture} />
          </mesh>
        )}
        <mesh>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, cardRadius, deckDepth]} />
          <meshBasicMaterial attach="material-0" map={texture} color={isDimmed ? "#999" : "white"} />
          <meshBasicMaterial attach="material-1" map={texture} color={isDimmed ? "#999" : "white"} />
          <meshBasicMaterial attach="material-2" color={isDimmed ? "#999" : "white"} />
        </mesh>
        <mesh position={textPosition}>
          <circleGeometry args={[1.5, 16]} />
          <meshBasicMaterial color="white" opacity={isDimmed ? 0.2 : 0.5} transparent />
        </mesh>
        <TextWithShadow
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          fontSize={1.8}
          position={textPosition}
          strokeColor="#555"
        >
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
