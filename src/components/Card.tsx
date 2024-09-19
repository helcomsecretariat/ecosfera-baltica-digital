import { cardHeight, cardWidth } from "../constants/card";
import GameElement from "./GameElement";

const Card = ({ x, y }: { x: number; y: number }) => {
  return (
    <GameElement position={[x, y, 0]} width={cardWidth} height={cardHeight}>
      <boxGeometry args={[cardWidth, cardHeight]} />
    </GameElement>
  );
};

export default Card;
