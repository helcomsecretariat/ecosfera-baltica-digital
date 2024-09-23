import { cardHeight, cardWidth } from "../constants/card";
import { Html, Text } from "@react-three/drei";
import GameElement from "./GameElement";
import { Button } from "./ui/button";
import { GiCardExchange } from "react-icons/gi";

const Deck = ({
  position,
  color,
  textColor = "white",
  name,
  onDraw,
  onShuffle,
  cards,
  options,
}: {
  position: [number, number, number];
  color: string;
  textColor?: string;
  name: string;
  onDraw: (id: string) => void;
  onShuffle?: () => void;
  cards: { name: string; id: string }[];
  options?: { shuffleable: boolean };
}) => {
  return (
    <>
      <GameElement
        position={position}
        height={cardHeight}
        width={cardWidth}
        options={{
          draggable: false,
          showHoverAnimation: false,
        }}
        onClick={() => onDraw(cards[0].id)}
      >
        <boxGeometry args={[cardWidth, cardHeight, 0]} />
        <meshBasicMaterial color={color} />
        <Text color={textColor} fontSize={2}>
          {name}
        </Text>
        <Html wrapperClass="!-top-[12%] bg-blue-500 left-0" center>
          {(options?.shuffleable ?? false) && (
            <Button
              variant="ghost"
              size="icon"
              color="white"
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
