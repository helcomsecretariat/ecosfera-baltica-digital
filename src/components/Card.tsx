import type { Card as CardType, Coordinate, GamePieceTransform } from "@/state/types";
import { cardHeight, cardWidth } from "../constants/card";
import GameElement from "./GameElement";
import { Text, useTexture } from "@react-three/drei";
import { getAssetPath, getElementColor } from "@/components/utils";
import React from "react";
import TextWithShadow from "@/components/shapes/TextWithShadow";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import { SRGBColorSpace } from "three";

const Card = ({
  card,
  gamePieceTransform,
  onDragEnd,
  onClick,
}: {
  card: CardType;
  gamePieceTransform: GamePieceTransform;
  onDragEnd?: (position: Coordinate) => void;
  onClick?: () => void;
}) => {
  const { name, type } = card;
  const cardIMGURL = getAssetPath(type, name);
  const texture = useTexture(cardIMGURL);
  texture.colorSpace = SRGBColorSpace;

  return (
    <GameElement
      position={gamePieceTransform.position}
      initialPosition={gamePieceTransform.initialPosition}
      rotation={gamePieceTransform.rotation}
      initialRotation={gamePieceTransform.initialRotation}
      width={cardWidth}
      height={cardHeight}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <mesh>
        <RoundedRectangleGeometry args={[cardWidth, cardHeight, 1.5, 0.01]} />
        <meshBasicMaterial attach="material-0" map={texture} />
        <meshBasicMaterial attach="material-1" color="#888" />
      </mesh>

      {/* @ts-expect-error TS is sad someties */}
      {card.elements?.map((name, index) => (
        <mesh
          key={index + name}
          rotation={[Math.PI / 2, 0, 0]}
          position={[cardWidth * 0.42, -cardHeight * 0.44 + index * 1.6, 0.15]}
        >
          <cylinderGeometry args={[0.7, 0.7, 0.1, 5, 1]} />
          <meshBasicMaterial color={getElementColor(name)} />
        </mesh>
      ))}

      {/* @ts-expect-error TS is sad someties */}
      {card.biomes?.map((name, index) => (
        <React.Fragment key={index + name}>
          <mesh rotation={[Math.PI / 2, Math.PI, 0]} position={[-cardWidth * 0.4 + index * 2, cardHeight / 2.3, 0.15]}>
            <cylinderGeometry args={[1, 1, 0.1, 6, 1]} />
            <meshBasicMaterial color={"#77dd77"} />
          </mesh>
          <Text color="black" fontSize={1.2} position={[-cardWidth * 0.4 + index * 2, cardHeight / 2.3, 0.26]}>
            {name[0].toUpperCase()}
          </Text>
        </React.Fragment>
      ))}

      {/* @ts-expect-error TS is sad someties */}
      {card.abilities?.map((name, index) => (
        <TextWithShadow
          key={index + name + "text"}
          color="#222"
          fontSize={1.9}
          position={[cardWidth * 0.4, cardHeight / 2.3 - index * 1.7, 0.15]}
        >
          {name === "move" ? "→" : name === "plus" ? "+" : name === "refresh" ? "↻" : name === "special" ? "⚡" : ""}
        </TextWithShadow>
      ))}

      {["plant", "animal"].includes(type) && (
        <TextWithShadow
          position={[-cardWidth / 2 + cardWidth * 0.05, -cardHeight / 4, 0.15]}
          color="black"
          fontSize={1.5}
          maxWidth={cardWidth * 0.85}
          anchorX="left"
          anchorY="top"
          textAlign="left"
        >
          {name}
        </TextWithShadow>
      )}
    </GameElement>
  );
};

export default Card;
