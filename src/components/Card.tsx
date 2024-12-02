import type { Card as CardType, GamePieceAppearance } from "@/state/types";
import { cardHeight, cardWidth, coordScale } from "../constants/card";
import GameElement from "./GameElement";
import { useTexture } from "@react-three/drei";
import { getAssetPath, getElementColor, getHighlightTextureAssetPath } from "@/components/utils";
import React, { useMemo } from "react";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import { useControls } from "leva";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useGameState } from "@/context/game-state/hook";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";
import CardAbilityTokens from "./CardAbilityTokens";
import { habitatTransforms } from "@/constants/gameBoard";
import { toVector3 } from "@/utils/3d";
import useHabitatIconTextures from "@/hooks/useHabitatIconTextures";
import useAbilityTextures from "@/hooks/useAbilityTextures";

const PADDING_MAP: Record<CardType["type"], [number, number, number, number]> = {
  animal: [6, 6, 8, 6].map((n) => n / coordScale) as [number, number, number, number],
  plant: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
  element: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
  disaster: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
  policy: [6, 6, 6, 6].map((n) => n / coordScale) as [number, number, number, number],
};

const HABITAT_ICON_RADIUS = 0.94;
const ELEMENT_ICON_RADIUS = 0.7;
const ABILITY_ICON_RADIUS = 11 / coordScale / 2;

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
  const backTexture = useSRGBTexture("/ecosfera_baltica/back.avif");
  const highlightTexture = useTexture(getHighlightTextureAssetPath());
  const { isShowUID, useDimmed } = useControls({ isShowUID: { value: false }, useDimmed: { value: true } });
  const isPlantOrAnimal = card.type === "plant" || card.type === "animal";
  const habitatIconTextures = useHabitatIconTextures();
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = PADDING_MAP[card.type];
  const abilityTextures = useAbilityTextures().zoomedIn;

  const { RelevantMaterial } = useRelevantMaterial();

  const elementsSorted: string[] = useMemo(() => {
    if (card.type !== "plant") return [];

    const elementsOrdering = state.deck.ordering.find(([type]) => type === "element")![1]!;

    return elementsOrdering
      .filter((element) => card.elements.includes(element))
      .flatMap((element) => Array.from({ length: card.elements.filter((n) => n === element).length }, () => element));
  }, []);
  const namePaddingBottom = elementsSorted.length > 0 ? ELEMENT_ICON_RADIUS * 2 + paddingBottom * 2 : paddingBottom;

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
        <mesh position={[0, 0, -0.1]}>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, 1.5, 0.02]} />
          <RelevantMaterial attach="material-0" map={backTexture} />
          <RelevantMaterial attach="material-1" />
        </mesh>
        <mesh>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, 1.5, 0.05]} />
          <RelevantMaterial attach="material-0" map={texture} />
          <RelevantMaterial attach="material-1" />
        </mesh>
        {isHighlighted && (
          <mesh>
            <RoundedRectangleGeometry args={[cardWidth + 8, cardHeight + 8, 1.5, 0.01]} />
            <meshBasicMaterial transparent attach="material-0" map={highlightTexture} />
            <meshBasicMaterial transparent opacity={0} attach="material-1" />
          </mesh>
        )}

        {/* Habitats */}
        {(card.type === "animal" || card.type === "plant") &&
          card.habitats?.map((name, index) => (
            <React.Fragment key={index + name}>
              <mesh
                rotation={toVector3(
                  habitatTransforms(-cardWidth * 0.4, cardHeight / 2.3)[name]?.rotation ?? {
                    x: Math.PI / 2,
                    y: Math.PI,
                    z: 0,
                  },
                )}
                position={[
                  -cardWidth * 0.5 + paddingLeft + HABITAT_ICON_RADIUS + index * HABITAT_ICON_RADIUS * 2,
                  cardHeight * 0.5 - paddingTop - HABITAT_ICON_RADIUS,
                  0.15,
                ]}
              >
                <cylinderGeometry args={[HABITAT_ICON_RADIUS, HABITAT_ICON_RADIUS, 0.1, 6, 1]} />
                <RelevantMaterial map={habitatIconTextures[name]} transparent />
              </mesh>
            </React.Fragment>
          ))}
        {/* Abilities */}
        {isPlantOrAnimal &&
          card.abilities?.map((name, index) => (
            <mesh
              key={index + name}
              rotation={[Math.PI / 2, Math.PI / 2, 0]}
              position={[
                cardWidth * 0.5 - paddingRight - ABILITY_ICON_RADIUS,
                cardHeight * 0.5 - paddingTop - ABILITY_ICON_RADIUS - index * 1.8,
                0.25,
              ]}
            >
              <cylinderGeometry args={[ABILITY_ICON_RADIUS, ABILITY_ICON_RADIUS, 0.25, 32, 1]} />
              <RelevantMaterial color={"white"} map={abilityTextures[name]} />
            </mesh>
          ))}
        {/* Ability Button */}
        {isPlantOrAnimal && options?.showAbilityButtons && card.abilities.length > 0 && (
          <CardAbilityTokens card={card} />
        )}

        {/* Name Label */}
        {["plant", "animal"].includes(type) && (
          <TextWithShadow
            position={[-cardWidth * 0.5 + paddingLeft, -cardHeight * 0.5 + namePaddingBottom, 0]}
            fontStyle="italic"
            strokeColor="#ffffff"
            outlineColor="#222222"
            outlineBlur="15%"
            fontSize={1.9}
            overflowWrap="break-word"
            maxWidth={cardWidth * 0.9}
            anchorX="left"
            anchorY="bottom"
            textAlign="left"
          >
            {name}
          </TextWithShadow>
        )}

        {elementsSorted.map((name, index) => (
          <mesh
            key={index + name}
            rotation={[Math.PI / 2, 0, 0]}
            position={[
              -cardWidth * 0.5 + paddingLeft + ELEMENT_ICON_RADIUS + index * ELEMENT_ICON_RADIUS * 2,
              -cardHeight * 0.5 + paddingBottom + ELEMENT_ICON_RADIUS,
              0.15,
            ]}
          >
            <cylinderGeometry args={[ELEMENT_ICON_RADIUS, ELEMENT_ICON_RADIUS, 0.1, 5, 1]} />
            <RelevantMaterial transparent color={getElementColor(name)} />
          </mesh>
        ))}
        {/* UID */}
        {isShowUID && (
          <TextWithShadow
            position={[0, 0, 0]}
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
          <mesh position={[0, 0, 0.15]}>
            <RoundedRectangleGeometry args={[cardWidth + 0.1, cardHeight + 0.1, 1.5, 0.2]} />
            <RelevantMaterial color="black" transparent opacity={options?.dimLevel ?? 0.8} />
          </mesh>
        )}
      </GameElement>
    )
  );
};

export default Card;
