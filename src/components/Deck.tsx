import { cardHeight, cardWidth } from "../constants/card";
import { Text } from "@react-three/drei";
import GameElement from "./GameElement";

const Deck = ({
  position,
  color,
  textColor = "white",
  name,
  onDraw,
  cards,
}: {
  position: [number, number, number];
  color: string;
  textColor?: string;
  name: string;
  onDraw: (id: string) => void;
  cards: { name: string; id: string }[];
}) => {
  return (
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
    </GameElement>
  );
};

export default Deck;
