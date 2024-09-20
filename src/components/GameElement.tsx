import { DragControls } from "@react-three/drei";
import { ReactNode, useRef, useState } from "react";
import {
  lowerXBoundary,
  lowerYBoundary,
  upperXBoundary,
  upperYBoundary,
} from "../constants/gameBoard";
import { decomposeMatrix } from "~/utils/3d";
import { Mesh } from "three";

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
  onDragEnd?: (position: [number, number, number]) => void;
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
  onDragEnd,
  children,
}: GameElementProps) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const ref = useRef<Mesh>(null);

  const handleDragEnd = () => {
    setHovered(false);
    if (onDragEnd === undefined || ref?.current?.matrixWorld === undefined)
      return;
    const updatedPosition = decomposeMatrix(ref.current.matrixWorld).position;
    onDragEnd([updatedPosition.x, updatedPosition.y, updatedPosition.z]);
  };

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
      onDragEnd={() => handleDragEnd()}
    >
      <mesh
        ref={ref}
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
