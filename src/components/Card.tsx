import { cardHeight, cardWidth } from "../constants/card";
import GameElement from "./GameElement";
import { Text } from "@react-three/drei";

const Card = ({
  position,
  name,
}: {
  position: [number, number, number];
  name: string;
}) => {
  return (
    <GameElement position={position} width={cardWidth} height={cardHeight}>
      <boxGeometry args={[cardWidth, cardHeight, 0]} />
      <Text color="black" fontSize={2} position={[0,0,0.1]}>
        {name}
      </Text>
    </GameElement>
  );
};

export default Card;
