import { cardHeight, cardWidth } from "../constants/card";
import GameElement from "./GameElement";
import { Text } from "@react-three/drei";

const Card = ({
  position,
  name,
  onDragEnd,
}: {
  position: [number, number, number];
  name: string;
  onDragEnd?: (position: [number, number, number]) => void;
}) => {
  return (
    <GameElement
      position={position}
      width={cardWidth}
      height={cardHeight}
      onDragEnd={onDragEnd}
    >
      <boxGeometry args={[cardWidth, cardHeight, 0]} />
      <Text
        color="black"
        fontSize={2}
        overflowWrap="break-word"
        maxWidth={12}
        textAlign="center"
      >
        {name}
      </Text>
    </GameElement>
  );
};

export default Card;
