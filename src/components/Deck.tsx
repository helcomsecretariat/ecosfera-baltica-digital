import {
  cardHeight,
  cardWidth,
  cardRadius,
  HIGHLIGHT_BORDER_COLOR,
  HIGHLIGHT_BORDER_WIDTH,
  CARD_Z_INDEX,
} from "../constants/card";
import GameElement from "./GameElement";
import { Card, GamePieceAppearance } from "@/state/types";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";

const Deck = ({
  gamePieceAppearance,
  texturePath = "/ecosfera_baltica/card_back.avif",
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
}) => {
  const texture = useSRGBTexture(texturePath);
  const textPosition: [number, number, number] = [
    -cardWidth / 2 + cardWidth * 0.15,
    cardHeight / 2 - cardHeight * 0.11,
    0.15,
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
          <mesh position={[0, 0, CARD_Z_INDEX.HIGHLIGHT_BORDER]}>
            <RoundedRectangleGeometry
              args={[
                cardWidth + HIGHLIGHT_BORDER_WIDTH,
                cardHeight + HIGHLIGHT_BORDER_WIDTH,
                cardRadius + HIGHLIGHT_BORDER_WIDTH / 2,
                0,
              ]}
            />
            <meshBasicMaterial transparent attach="material-0" color={HIGHLIGHT_BORDER_COLOR} />
            <meshBasicMaterial transparent opacity={0} attach="material-1" />
            <meshBasicMaterial transparent opacity={0} attach="material-2" />
          </mesh>
        )}
        <mesh>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, cardRadius, 0]} />
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
      </GameElement>
    </>
  );
};

export default Deck;
