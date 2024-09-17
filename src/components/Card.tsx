import { DragControls } from "@react-three/drei";
import { cardHeight, cardWidth } from "../constants/card";
import {
  lowerXBoundary,
  lowerYBoundary,
  upperXBoundary,
  upperYBoundary,
} from "../constants/gameBoard";

const Card = ({ x, y }: { x: number; y: number }) => {
  return (
    <DragControls
      dragLimits={[
        [
          lowerXBoundary + x * -1 + cardWidth / 2,
          upperXBoundary + x * -1 - cardWidth / 2,
        ],
        [
          lowerYBoundary + y * -1 + cardHeight / 2,
          upperYBoundary + y * -1 - cardHeight / 2,
        ],
        [0, 0],
      ]}
    >
      <mesh position={[x, y, 0]}>
        <boxGeometry args={[cardWidth, cardHeight, 0]} />
      </mesh>
    </DragControls>
  );
};

export default Card;
