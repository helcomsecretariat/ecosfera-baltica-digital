import type { Card as CardType, GamePieceAppearance } from "@/state/types";
import {
  CARD_Z_INDEX,
  cardHeight,
  cardRadius,
  cardWidth,
  coordScale,
  HIGHLIGHT_BORDER_COLOR,
  HIGHLIGHT_BORDER_WIDTH,
} from "../constants/card";
import GameElement from "./GameElement";
import { getAssetPath } from "@/components/utils";
import { useMemo } from "react";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import { useControls } from "leva";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useGameState } from "@/context/game-state/hook";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";
import CardAbilityTokens from "./CardAbilityTokens";
import useHabitatIconTextures from "@/hooks/useHabitatIconTextures";
import useAbilityTextures from "@/hooks/useAbilityTextures";
import { DoubleSide, FrontSide } from "three";
import useElementIconTextures, { ElementName } from "@/hooks/useElementIconTextures";

const PADDING_MAP: Record<CardType["type"], [number, number, number, number]> = {
  animal: [6, 6, 8, 6].map((n) => n / coordScale) as [number, number, number, number],
  plant: [6, 6, 2, 6].map((n) => n / coordScale) as [number, number, number, number],
  element: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
  disaster: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
  policy: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
};

const ELEMENT_ICON_SIZE = 15 / coordScale;
const HABITAT_ICON_SIZE = 11 / coordScale;
const HABITAT_SPACING = 0.2;
const HABITAT_CONTAINER_PADDING = 3 / coordScale;
const ABILITY_ICON_SIZE = HABITAT_ICON_SIZE + HABITAT_CONTAINER_PADDING * 2;
const ABILITY_ICON_SPACING = 3 / coordScale;
const ELEMENTS_BACKGROUND_HEIGHT = 18 / coordScale;

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
  const texture = useSRGBTexture(cardIMGURL);
  const backTexture = useSRGBTexture("/ecosfera_baltica/card_back.avif");
  const { isShowUID, useDimmed } = useControls({ isShowUID: { value: false }, useDimmed: { value: true } });
  const isPlantOrAnimal = card.type === "plant" || card.type === "animal";
  const habitatIconTextures = useHabitatIconTextures();
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = PADDING_MAP[card.type];
  const abilityTextures = useAbilityTextures().zoomedIn;
  const elementIconTextures = useElementIconTextures();
  const hasMoreThanThreeHabitats = (card.type === "plant" || card.type === "animal") && card.habitats?.length > 3;

  const { RelevantMaterial } = useRelevantMaterial();

  const hasElements = card.type === "plant" && card.elements.length > 0;

  const elementsSorted: ElementName[] = useMemo(() => {
    if (card.type !== "plant") return [];

    const elementsOrdering = state.deck.ordering.find(([type]) => type === "element")![1]!;

    return elementsOrdering
      .filter((element) => card.elements.includes(element))
      .flatMap((element) =>
        Array.from({ length: card.elements.filter((n) => n === element).length }, () => element),
      ) as ElementName[];
  }, [card]);

  const namePaddingBottom = elementsSorted.length > 0 ? ELEMENT_ICON_SIZE + paddingBottom * 4 : paddingBottom;

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
          <RelevantMaterial attach="material-0" map={texture} side={FrontSide} />
          <RelevantMaterial attach="material-1" map={backTexture} side={FrontSide} />
          <RelevantMaterial attach="material-2" color={"white"} side={FrontSide} />
        </mesh>

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

        {/* Habitats */}
        {(card.type === "animal" || card.type === "plant") && card.habitats && card.habitats.length > 0 && (
          <>
            {/* White background pill */}
            <mesh
              position={[
                -cardWidth * 0.5 +
                  paddingLeft +
                  ((HABITAT_ICON_SIZE + HABITAT_SPACING) * card.habitats.length -
                    HABITAT_SPACING +
                    HABITAT_CONTAINER_PADDING * 2) /
                    2,
                cardHeight * 0.5 - paddingTop - HABITAT_CONTAINER_PADDING - HABITAT_ICON_SIZE / 2,
                CARD_Z_INDEX.HABITAT_BACKGROUND,
              ]}
            >
              <RoundedRectangleGeometry
                args={[
                  (HABITAT_ICON_SIZE + HABITAT_SPACING) * card.habitats.length -
                    HABITAT_SPACING +
                    HABITAT_CONTAINER_PADDING * 2,
                  HABITAT_ICON_SIZE + HABITAT_CONTAINER_PADDING * 2,
                  (HABITAT_ICON_SIZE + HABITAT_CONTAINER_PADDING * 2) / 2,
                  0,
                ]}
              />
              <RelevantMaterial color="white" />
            </mesh>

            {/* Habitat icons */}
            {card.habitats?.map((name, index) => (
              <mesh
                key={index + name}
                position={[
                  -cardWidth * 0.5 +
                    paddingLeft +
                    HABITAT_CONTAINER_PADDING +
                    HABITAT_ICON_SIZE / 2 +
                    index * (HABITAT_ICON_SIZE + HABITAT_SPACING),
                  cardHeight * 0.5 - paddingTop - HABITAT_CONTAINER_PADDING - HABITAT_ICON_SIZE / 2,
                  CARD_Z_INDEX.HABITAT_ICONS,
                ]}
              >
                <planeGeometry args={[HABITAT_ICON_SIZE, HABITAT_ICON_SIZE]} />
                <RelevantMaterial transparent map={habitatIconTextures[name]} />
              </mesh>
            ))}
          </>
        )}

        {/* Abilities */}
        {isPlantOrAnimal &&
          card.abilities?.map((name, index) => (
            <mesh
              key={index + name}
              position={[
                cardWidth * 0.5 - paddingRight - ABILITY_ICON_SIZE / 2,
                cardHeight * 0.5 -
                  paddingTop -
                  ABILITY_ICON_SIZE / 2 -
                  index * (ABILITY_ICON_SIZE + ABILITY_ICON_SPACING) -
                  (hasMoreThanThreeHabitats ? ABILITY_ICON_SIZE + ABILITY_ICON_SPACING : 0),
                CARD_Z_INDEX.ABILITY_ICONS,
              ]}
            >
              <circleGeometry args={[ABILITY_ICON_SIZE / 2, 32]} />
              <RelevantMaterial map={abilityTextures[name]} />
            </mesh>
          ))}
        {/* Ability Button */}
        {isPlantOrAnimal && options?.showAbilityButtons && card.abilities.length > 0 && (
          <CardAbilityTokens card={card} />
        )}

        {/* Name Label */}
        {["plant", "animal"].includes(type) && (
          <TextWithShadow
            position={[0, -cardHeight * 0.5 + namePaddingBottom, CARD_Z_INDEX.NAME_LABEL]}
            fontStyle="italic"
            strokeColor="#ffffff"
            outlineOffsetX={1 / coordScale}
            outlineOffsetY={1 / coordScale}
            outlineColor="#000"
            outlineBlur={3 / coordScale}
            fontSize={1.6}
            overflowWrap="break-word"
            maxWidth={cardWidth}
            anchorX="center"
            anchorY="bottom"
            textAlign="center"
          >
            {name}
          </TextWithShadow>
        )}

        {hasElements && (
          <>
            <mesh position={[0, -cardHeight * 0.5 + ELEMENTS_BACKGROUND_HEIGHT / 2, CARD_Z_INDEX.ELEMENTS_BACKGROUND]}>
              <RoundedRectangleGeometry args={[cardWidth, ELEMENTS_BACKGROUND_HEIGHT, cardRadius, 0]} />
              <RelevantMaterial color="white" side={DoubleSide} />
            </mesh>

            <mesh
              position={[
                0,
                -cardHeight * 0.5 + ELEMENTS_BACKGROUND_HEIGHT / 2 + cardRadius,
                CARD_Z_INDEX.ELEMENTS_BACKGROUND,
              ]}
            >
              <planeGeometry args={[cardWidth, cardRadius]} />
              <RelevantMaterial color="white" side={DoubleSide} />
            </mesh>
          </>
        )}

        {elementsSorted.map((name, index) => (
          <mesh
            key={index + name}
            position={[
              -cardWidth * 0.5 +
                paddingLeft +
                ELEMENT_ICON_SIZE / 2 +
                // Center the elements by offsetting by half of the total width
                (cardWidth - paddingLeft - paddingRight - elementsSorted.length * ELEMENT_ICON_SIZE) / 2 +
                index * ELEMENT_ICON_SIZE,
              -cardHeight * 0.5 + paddingBottom + ELEMENT_ICON_SIZE / 2,
              CARD_Z_INDEX.ELEMENT_ICONS,
            ]}
          >
            <planeGeometry args={[ELEMENT_ICON_SIZE, ELEMENT_ICON_SIZE]} />
            <RelevantMaterial transparent map={elementIconTextures[name]} />
          </mesh>
        ))}
        {/* UID */}
        {isShowUID && (
          <TextWithShadow
            position={[0, 0, CARD_Z_INDEX.UID]}
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
          <mesh position={[0, 0, CARD_Z_INDEX.DIMMED_OVERLAY]}>
            <RoundedRectangleGeometry args={[cardWidth + 0.1, cardHeight + 0.1, cardRadius, 0]} />
            <RelevantMaterial color="black" transparent opacity={options?.dimLevel ?? 0.8} />
          </mesh>
        )}
      </GameElement>
    )
  );
};

export default Card;
