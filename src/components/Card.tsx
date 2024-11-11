import type { Card as CardType, GamePieceAppearance } from "@/state/types";
import { cardHeight, cardWidth } from "../constants/card";
import GameElement from "./GameElement";
import { Text, useTexture } from "@react-three/drei";
import { getAssetPath, getElementColor, getHighlightTextureAssetPath } from "@/components/utils";
import React, { useMemo } from "react";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import { useControls } from "leva";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useGameState } from "@/context/game-state/hook";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";

export type CardOptions = {
  showAbilityButton?: boolean;
  dimLevel?: 0.8 | 0.3;
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
  const { emit, state } = useGameState();
  const { name, type } = card;
  const cardIMGURL = getAssetPath(type, name);
  const texture = useSRGBTexture(cardIMGURL);
  const backTexture = useSRGBTexture("/ecosfera_baltica/back.avif");
  const highlightTexture = useTexture(getHighlightTextureAssetPath());
  const dropTexture = useTexture("/ecosfera_baltica/ability_drop.avif");
  const dropActiveTexture = useTexture("/ecosfera_baltica/ability_drop_active.avif");
  const { isShowUID, useDimmed } = useControls({ isShowUID: { value: false }, useDimmed: { value: false } });
  const isPlantOrAnimal = card.type === "plant" || card.type === "animal";

  const { RelevantMaterial } = useRelevantMaterial();

  const elementsSorted: string[] = useMemo(() => {
    if (card.type !== "plant") return [];

    const elementsOrdering = state.deck.ordering.find(([type]) => type === "element")![1]!;

    return elementsOrdering
      .filter((element) => card.elements.includes(element))
      .flatMap((element) => Array.from({ length: card.elements.filter((n) => n === element).length }, () => element));
  }, []);

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
        {elementsSorted.map((name, index) => (
          <mesh
            key={index + name}
            rotation={[Math.PI / 2, 0, 0]}
            position={[-cardWidth * 0.42 + index * 1.6, -cardHeight * 0.44, 0.15]}
          >
            <cylinderGeometry args={[0.7, 0.7, 0.1, 5, 1]} />
            <RelevantMaterial transparent color={getElementColor(name)} />
          </mesh>
        ))}
        {/* Habitats */}
        {(card.type === "animal" || card.type === "plant") &&
          card.habitats?.map((name, index) => (
            <React.Fragment key={index + name}>
              <mesh
                rotation={[Math.PI / 2, Math.PI, 0]}
                position={[-cardWidth * 0.4 + index * 2, cardHeight / 2.3, 0.15]}
              >
                <cylinderGeometry args={[1, 1, 0.1, 6, 1]} />
                <RelevantMaterial color="#77dd77" transparent />
              </mesh>
              <Text color="black" fontSize={1.2} position={[-cardWidth * 0.4 + index * 2, cardHeight / 2.3, 0.2]}>
                {name[0].toUpperCase()}
              </Text>
            </React.Fragment>
          ))}
        {/* Abilities */}
        {isPlantOrAnimal &&
          card.abilities?.map((name, index) => (
            <TextWithShadow
              key={index + name + "text"}
              color="#222"
              fontSize={1.9}
              position={[cardWidth * 0.4, cardHeight / 2.3 - index * 1.7, 0.15]}
            >
              {name === "move"
                ? "→"
                : name === "plus"
                  ? "+"
                  : name === "refresh"
                    ? "↻"
                    : name === "special"
                      ? "⚡"
                      : ""}
            </TextWithShadow>
          ))}
        {/* Ability Button */}
        {isPlantOrAnimal && options?.showAbilityButton && card.abilities.length > 0 && (
          <mesh
            position={[0, cardHeight / 2 + 3, 0]}
            onClick={(e) => {
              e.stopPropagation();
              emit.abilityCardClick(card)();
            }}
          >
            <circleGeometry args={[1.5, 32]} />
            <meshBasicMaterial
              map={state.turn.selectedAbilityCard?.uid === card.uid ? dropActiveTexture : dropTexture}
              color={state.turn.usedAbilities?.map((ability) => ability.source).includes(card.uid) ? "#555" : undefined}
            />
          </mesh>
        )}
        {/* Name Label */}
        {["plant", "animal"].includes(type) && (
          <TextWithShadow
            position={[-cardWidth / 2 + cardWidth * 0.05, -cardHeight / 5.7, 0.15]}
            color="black"
            fontSize={1.5}
            maxWidth={cardWidth * 0.9}
            anchorX="left"
            anchorY="top"
            textAlign="left"
          >
            {name}
          </TextWithShadow>
        )}
        {/* UID */}
        {isShowUID && (
          <TextWithShadow
            position={[-cardWidth / 2 + cardWidth * 0.05, -cardHeight / 3, 0.15]}
            color="black"
            fontSize={1.5}
            maxWidth={cardWidth * 0.85}
            anchorX="left"
            anchorY="top"
            textAlign="left"
          >
            {card.uid}
          </TextWithShadow>
        )}
        {/* Dimmed Overlay */}
        {useDimmed && isDimmed && (
          <mesh position={[0, 0, 0.15]}>
            <RoundedRectangleGeometry args={[cardWidth + 0.1, cardHeight + 0.1, 1.5, 0.15]} />
            <RelevantMaterial color="black" transparent opacity={options?.dimLevel ?? 0.8} />
          </mesh>
        )}
      </GameElement>
    )
  );
};

export default Card;
