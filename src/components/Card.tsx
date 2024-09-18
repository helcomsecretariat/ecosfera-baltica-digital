import { DragControls } from "@react-three/drei";
import { cardHeight, cardWidth } from "../constants/card";
import {
  lowerXBoundary,
  lowerYBoundary,
  upperXBoundary,
  upperYBoundary,
} from "../constants/gameBoard";
import { useState } from "react";

const Card = ({ x, y }: { x: number; y: number }) => {
  const [dragging, setDragging] = useState(false);

  return (
    <DragControls
      onDrag={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
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
        <boxGeometry args={[cardWidth * (dragging ? 1.2 : 1), cardHeight * (dragging ? 1.2 : 1), 0]} />
      </mesh>
    </DragControls>
  );
};

export default Card;
