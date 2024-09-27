import { cardHeight, cardWidth } from "../constants/card";
import { Html, useTexture } from "@react-three/drei";
import GameElement from "./GameElement";
import { Button } from "./ui/button";
import { GiCardExchange } from "react-icons/gi";
import { Card } from "@/state/types";
import { RoundedRectangleGeometry } from "@/components/shapes/roundedRect";
import { SRGBColorSpace } from "three";
import TextWithShadow from "@/components/shapes/TextWithShadow";

const Deck = ({
  position,
  rotation = [0, 0, 0],
  texturePath = "/ecosfera_baltica/element_nutrients.avif",
  onDraw,
  onShuffle,
  cards,
  options,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  texturePath: string;
  textColor?: string;
  onDraw: (card: Card) => void;
  onShuffle?: () => void;
  cards: Card[];
  options?: { shuffleable: boolean };
}) => {
  const texture = useTexture(texturePath);
  const deckDepth = 0.1 * cards.length;
  const textPosition: [number, number, number] = [-cardWidth / 2 + cardWidth * 0.15, -cardHeight / 2 + cardHeight * 0.15, deckDepth + 0.15] ;
  texture.colorSpace = SRGBColorSpace;

  return (
    <>
      <GameElement
        position={position}
        rotation={rotation}
        height={cardHeight}
        width={cardWidth}
        options={{
          draggable: false,
          showHoverAnimation: false,
        }}
        onClick={() => (cards.length > 0 ? onDraw(cards[0]) : null)}
      >
        <mesh>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, 1.5, deckDepth]} />
          <meshBasicMaterial attach="material-0" map={texture} />
          <meshBasicMaterial attach="material-1" color="#eee" />
        </mesh>
        <mesh
          position={textPosition}
        >
          <circleGeometry args={[1.5, 16]} />
          <meshBasicMaterial color="white" opacity={0.5} transparent />
        </mesh>
        <TextWithShadow
          textAlign="center"
          fontSize={2}
          position={textPosition}
        >
          {cards.length}
        </TextWithShadow>
        <Html transform scale={3.5} center position={[0, cardHeight / 2, 0]}>
          {(options?.shuffleable ?? false) && (
            <Button variant="default" size="icon" name="Shuffle" onClick={onShuffle}>
              <GiCardExchange className="h-6 w-6" />
            </Button>
          )}
        </Html>
      </GameElement>
    </>
  );
};

export default Deck;
