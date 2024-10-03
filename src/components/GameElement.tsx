import { ReactNode, useRef, useState } from "react";
import {
  lowerXBoundary,
  lowerYBoundary,
  rotationOverrideThreshold,
  upperXBoundary,
  upperYBoundary,
} from "../constants/gameBoard";
import { decomposeMatrix } from "@/utils/3d";
import { motion } from "framer-motion-3d";
import { Coordinate } from "@/state/types";
import { MeshProps } from "@react-three/fiber";
import { DragControls } from "./DragControls";

type GameElementProps = {
  position: Coordinate;
  initialPosition?: Coordinate;
  rotation?: Coordinate;
  height: number;
  width: number;
  options?: {
    draggable?: boolean;
    showHoverAnimation?: boolean;
  };
  onClick?: () => void;
  onDragEnd?: (position: Coordinate) => void;
  children: ReactNode;
};

const GameElement = ({
  position,
  initialPosition = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
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
  const [dragging, setDragging] = useState<boolean>(false);
  const [rotationOverride, setRotationOverride] = useState<Coordinate | null>(null);
  const ref = useRef<MeshProps>(null);

  const handleDragEnd = () => {
    setDragging(false);
    setHovered(false);
    if (onDragEnd === undefined || ref?.current?.matrixWorld === undefined) return;
    const updatedPosition = decomposeMatrix(ref.current.matrixWorld).position;
    onDragEnd({ x: updatedPosition.x, y: updatedPosition.y, z: updatedPosition.z });
    if (updatedPosition.x > upperXBoundary * rotationOverrideThreshold) {
      setRotationOverride({ x: 0, y: 0, z: Math.PI / 2 });
      return;
    } else if (updatedPosition.x < lowerXBoundary * rotationOverrideThreshold) {
      setRotationOverride({ x: 0, y: 0, z: (-1 * Math.PI) / 2 });
    } else if (updatedPosition.y > upperYBoundary * rotationOverrideThreshold) {
      setRotationOverride({ x: 0, y: 0, z: (2 * Math.PI) / 2 });
    } else {
      setRotationOverride({ x: 0, y: 0, z: 0 });
    }
  };

  return (
    <DragControls
      dragLimits={[
        [lowerXBoundary + position.x * -1 + width / 2, upperXBoundary + position.x * -1 - width / 2],
        [lowerYBoundary + position.y * -1 + height / 2, upperYBoundary + position.y * -1 - height / 2],
        [0, 0],
      ]}
      dragConfig={{ enabled: options?.draggable ?? true }}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => handleDragEnd()}
      autoTransform
      onClick={onClick}
    >
      <motion.mesh
        ref={ref}
        animate={{
          x: [initialPosition.x, initialPosition.x, position.x, position.x],
          y: [initialPosition.y, initialPosition.y, position.y, position.y],
          z: [initialPosition.z, 8, 8, position.z],
        }}
        transition={{ ease: "anticipate", times: [0, 0.05, 0.8, 1], duration: 0.8 }}
        initial={{ x: initialPosition.x, y: initialPosition.y, z: initialPosition.z }}
        scale={(hovered || dragging) && (options?.showHoverAnimation ?? true) ? 1.15 : 1}
        rotation={[
          rotationOverride?.x ?? rotation.x,
          rotationOverride?.y ?? rotation.y,
          rotationOverride?.z ?? rotation.z,
        ]}
        onPointerOver={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {children}
      </motion.mesh>
    </DragControls>
  );
};

export default GameElement;
