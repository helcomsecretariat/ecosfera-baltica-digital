import { DragControls } from "@react-three/drei";
import { ReactNode, useState } from "react";
import {
  lowerXBoundary,
  lowerYBoundary,
  upperXBoundary,
  upperYBoundary,
} from "../constants/gameBoard";

type GameElementProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  height: number;
  width: number;
  options?: {
    draggable?: boolean;
    showHoverAnimation?: boolean;
  };
  onClick?: () => void;
  children: ReactNode;
};

const GameElement = ({
  position,
  rotation = [0, 0, 0],
  height,
  width,
  options = {
    draggable: true,
    showHoverAnimation: true,
  },
  onClick,
  children,
}: GameElementProps) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <DragControls
      dragLimits={[
        [
          lowerXBoundary + position[0] * -1 + width / 2,
          upperXBoundary + position[0] * -1 - width / 2,
        ],
        [
          lowerYBoundary + position[1] * -1 + height / 2,
          upperYBoundary + position[1] * -1 - height / 2,
        ],
        [0, 0],
      ]}
      dragConfig={{ enabled: options?.draggable ?? true }}
      onDragStart={() => setHovered(true)}
      onDragEnd={() => setHovered(false)}
    >
      <mesh
        scale={hovered && (options?.showHoverAnimation ?? true) ? 1.15 : 1}
        position={position}
        rotation={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        {children}
      </mesh>
    </DragControls>
  );
};

export default GameElement;
