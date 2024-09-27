import { cardHeight, cardWidth } from "../constants/card";
import { Html, Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { Button } from "./ui/button";
import { GiCardExchange } from "react-icons/gi";
import { Card } from "@/state/types";

const Deck = ({
  position,
  rotation = [0, 0, 0],
  color,
  textColor = "white",
  name,
  onDraw,
  onShuffle,
  cards,
  options,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  textColor?: string;
  name: string;
  onDraw: (card: Card) => void;
  onShuffle?: () => void;
  cards: Card[];
  options?: { shuffleable: boolean };
}) => {
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
        <boxGeometry args={[cardWidth, cardHeight, 0]} />
        <meshBasicMaterial color={color} />
        <Text textAlign="center" color={textColor} fontSize={2}>
          {name}
        </Text>
        <Html transform scale={3.5} center position={[0, cardHeight / 2, 0]}>
          {(options?.shuffleable ?? false) && (
            <Button
              variant="default"
              size="icon"
              name="Shuffle"
              onClick={onShuffle}
            >
              <GiCardExchange className="w-6 h-6" />
            </Button>
          )}
        </Html>
      </GameElement>
    </>
  );
};

export default Deck;
