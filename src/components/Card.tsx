import type { Card as CardType } from "@/state/types";
import { cardHeight, cardWidth } from "../constants/card";
import GameElement from "./GameElement";
import { Text, useTexture } from "@react-three/drei";
import {
  getAssetPath,
  getCardBGColor,
  getElementColor,
} from "@/components/utils";
import React from "react";

const Card = ({
  card,
  rotation = [0, 0, 0],
  onDragEnd,
}: {
  card: CardType & { x: number; y: number };
  rotation?: [number, number, number];
  onDragEnd?: (position: [number, number, number]) => void;
}) => {
  let cardFaceJSX = <></>;
  const { name, type } = card;
  const cardIMGURL = getAssetPath(type, name);
  const texture = useTexture(cardIMGURL);
  const bgColor = getCardBGColor(card);

  switch (type) {
    case "plant":
    case "animal":
    case "disaster":
    case "element":
      cardFaceJSX = (
        <>
          <mesh position={[0, cardWidth / 5, 0.01]}>
            <planeGeometry args={[cardWidth, cardWidth]} />
            <meshBasicMaterial map={texture} />
          </mesh>

          {/* @ts-expect-error TS is sad someties */}
          {card.elements?.map((name, index) => (
            <mesh
              key={index + name}
              rotation={[Math.PI / 2, 0, 0]}
              position={[
                cardWidth * 0.44,
                -cardHeight * 0.44 + index * 1.6,
                0.01,
              ]}
            >
              <cylinderGeometry args={[0.7, 0.7, 0.1, 6, 1]} />
              <meshBasicMaterial color={getElementColor(name)} />
            </mesh>
          ))}

          {/* @ts-expect-error TS is sad someties */}
          {card.biomes?.map((name, index) => (
            <React.Fragment key={index + name}>
              <mesh
                rotation={[Math.PI / 2, Math.PI, 0]}
                position={[
                  -cardWidth * 0.42 + index * 2,
                  cardHeight / 2.3,
                  0.01,
                ]}
              >
                <cylinderGeometry args={[1, 1, 0.1, 3, 1]} />
                <meshBasicMaterial color={"#77dd77"} />
              </mesh>
              <Text
                color="black"
                fontSize={1.2}
                position={[
                  -cardWidth * 0.42 + index * 2,
                  cardHeight / 2.3,
                  0.15,
                ]}
              >
                {name[0].toUpperCase()}
              </Text>
            </React.Fragment>
          ))}

          {/* @ts-expect-error TS is sad someties */}
          {card.abilities?.map((name, index) => (
            <Text
              key={index + name + "text"}
              color="#222"
              fontSize={1.9}
              position={[
                cardWidth * 0.42,
                cardHeight / 2.3 - index * 1.6,
                0.15,
              ]}
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
            </Text>
          ))}

          <Text
            position={[-cardWidth / 2 + cardWidth * 0.05, -cardHeight / 4, 0.1]}
            color="black"
            fontSize={1.5}
            maxWidth={cardWidth * 0.85}
            anchorX="left"
            anchorY="top"
            textAlign="left"
          >
            {name}
          </Text>
        </>
      );
      break;
  }
  return (
    <GameElement
      position={[card.x, card.y, 0.1]}
      rotation={rotation}
      width={cardWidth}
      height={cardHeight}
      onDragEnd={onDragEnd}
    >
      <boxGeometry args={[cardWidth, cardHeight, 0]} />
      <meshBasicMaterial color={bgColor} />

      {cardFaceJSX}
    </GameElement>
  );
};

export default Card;
