import type { Card as CardType, GamePieceAppearance } from "@/state/types";
import { cardHeight, cardRadius, cardWidth, coordScale } from "../constants/card";
import GameElement from "./GameElement";
import { useTexture } from "@react-three/drei";
import { getAssetPath, getHighlightTextureAssetPath } from "@/components/utils";
import { useEffect, useState } from "react";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import { useControls } from "leva";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useGameState } from "@/context/game-state/hook";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";
import CardAbilityTokens from "./CardAbilityTokens";
import { TextureLoader } from "three";
import { bakeCardTexture } from "@/utils/cardBaker";

const PADDING_MAP: Record<CardType["type"], [number, number, number, number]> = {
  animal: [6, 6, 8, 6].map((n) => n / coordScale) as [number, number, number, number],
  plant: [6, 6, 2, 6].map((n) => n / coordScale) as [number, number, number, number],
  element: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
  disaster: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
  policy: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
};

const HIGHLIGHT_BORDER_WIDTH = 5 / coordScale;
const HIGHLIGHT_BORDER_COLOR = "#3b82f6";

const Z_INDEX = {
  CARD_BASE: 0,
  HIGHLIGHT: 0.05,
  HABITAT_BACKGROUND: 0.1,
  HABITAT_ICONS: 0.15,
  ABILITY_ICONS: 0.1,
  NAME_LABEL: 0.1,
  UID: 0.35,
  DIMMED_OVERLAY: 0.18,
  HIGHLIGHT_BORDER: -0.2,
};

export type CardOptions = {
  showAbilityButtons?: boolean;
  dimLevel?: number;
};

export type CardProps = {
  card: CardType;
  gamePieceAppearance: GamePieceAppearance;
  onClick?: () => void;
  options?: CardOptions;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  withFloatAnimation?: boolean;
};

const Card = ({
  card,
  gamePieceAppearance,
  onClick,
  options,
  isHighlighted = false,
  isDimmed = false,
  withFloatAnimation = false,
}: CardProps) => {
  const { state } = useGameState();
  const { name, type } = card;
  const cardIMGURL = getAssetPath(type, name);
  const baseTexture = useSRGBTexture(cardIMGURL);
  const [texture, setTexture] = useState(baseTexture);
  const backTexture = useSRGBTexture("/ecosfera_baltica/card_back.avif");
  const highlightTexture = useTexture(getHighlightTextureAssetPath());
  const { isShowUID, useDimmed } = useControls({ isShowUID: { value: false }, useDimmed: { value: true } });
  const isPlantOrAnimal = card.type === "plant" || card.type === "animal";

  const { RelevantMaterial } = useRelevantMaterial();

  useEffect(() => {
    bakeCardTexture(card, baseTexture, state.deck).then((dataUrl) => {
      const loader = new TextureLoader();
      loader.load(dataUrl, (bakedTexture) => {
        bakedTexture.flipY = baseTexture.flipY;
        bakedTexture.colorSpace = baseTexture.colorSpace;
        setTexture(bakedTexture);
      });
    });
    // @ts-expect-error doens't matter here
  }, [card.elements]);

  return (
    gamePieceAppearance && (
      <GameElement
        width={cardWidth}
        height={cardHeight}
        onClick={onClick}
        key={card.uid}
        cardUID={card.uid}
        withFloatAnimation={withFloatAnimation}
      >
        <mesh>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, cardRadius, 0]} />
          <RelevantMaterial attach="material-0" map={texture} />
          <RelevantMaterial attach="material-1" map={backTexture} />
          <RelevantMaterial attach="material-2" color={"white"} />
        </mesh>

        {isHighlighted && (
          <mesh position={[0, 0, Z_INDEX.HIGHLIGHT_BORDER]}>
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

        {/* Ability Button */}
        {isPlantOrAnimal && options?.showAbilityButtons && card.abilities.length > 0 && (
          <CardAbilityTokens card={card} />
        )}

        {/* UID */}
        {isShowUID && (
          <TextWithShadow
            position={[0, 0, Z_INDEX.UID]}
            strokeColor="white"
            outlineColor="#222222"
            outlineBlur={0.8}
            outlineOpacity={1}
            fontSize={2}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
          >
            {card.uid}
          </TextWithShadow>
        )}

        {/* Dimmed Overlay */}
        {useDimmed && isDimmed && (
          <mesh position={[0, 0, Z_INDEX.DIMMED_OVERLAY]}>
            <RoundedRectangleGeometry args={[cardWidth + 0.1, cardHeight + 0.1, cardRadius, 0]} />
            <RelevantMaterial color="black" transparent opacity={options?.dimLevel ?? 0.8} />
          </mesh>
        )}
      </GameElement>
    )
  );
};

export default Card;
