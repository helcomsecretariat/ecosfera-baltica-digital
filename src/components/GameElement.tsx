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
import { Coordinate, GamePieceAppearance } from "@/state/types";
import { MeshProps } from "@react-three/fiber";
import { DragControls } from "./DragControls";

type GameElementProps = {
  gamePieceAppearance: GamePieceAppearance;
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
  gamePieceAppearance,
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
        [
          lowerXBoundary + gamePieceAppearance.transform.position.x * -1 + width / 2,
          upperXBoundary + gamePieceAppearance.transform.position.x * -1 - width / 2,
        ],
        [
          lowerYBoundary + gamePieceAppearance.transform.position.y * -1 + height / 2,
          upperYBoundary + gamePieceAppearance.transform.position.y * -1 - height / 2,
        ],
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
        position-z={gamePieceAppearance.transform.position.z}
        animate={{
          x: [
            gamePieceAppearance.transform.initialPosition?.x ?? 0,
            gamePieceAppearance.transform.initialPosition?.x ?? 0,
            gamePieceAppearance.transform.position.x,
            gamePieceAppearance.transform.position.x,
          ],
          y: [
            gamePieceAppearance.transform.initialPosition?.y ?? 0,
            gamePieceAppearance.transform.initialPosition?.y ?? 0,
            gamePieceAppearance.transform.position.y,
            gamePieceAppearance.transform.position.y,
          ],
          z: [gamePieceAppearance.transform.initialPosition?.z ?? 0, 8, 8, gamePieceAppearance.transform.position.z],
          rotateX: [
            gamePieceAppearance.transform.initialRotation?.x ?? 0,
            gamePieceAppearance.transform.initialRotation?.x ?? 0,
            gamePieceAppearance.transform.rotation.x,
            gamePieceAppearance.transform.rotation.x,
          ],
          rotateY: [
            gamePieceAppearance.transform.initialRotation?.y ?? 0,
            gamePieceAppearance.transform.initialRotation?.y ?? 0,
            gamePieceAppearance.transform.rotation.y,
            gamePieceAppearance.transform.rotation.y,
          ],
          rotateZ: [
            gamePieceAppearance.transform.initialRotation?.z ?? 0,
            gamePieceAppearance.transform.initialRotation?.z ?? 0,
            gamePieceAppearance.transform.rotation.z,
            gamePieceAppearance.transform.rotation.z,
          ],
        }}
        exit={{
          x: [
            gamePieceAppearance.transform.position.x,
            gamePieceAppearance.transform.position.x,
            gamePieceAppearance.transform.exitPosition?.x ?? 0,
            gamePieceAppearance.transform.exitPosition?.x ?? 0,
          ],
          y: [
            gamePieceAppearance.transform.position.y,
            gamePieceAppearance.transform.position.y,
            gamePieceAppearance.transform.exitPosition?.y ?? 0,
            gamePieceAppearance.transform.exitPosition?.y ?? 0,
          ],
          z: [gamePieceAppearance.transform.position.z, 8, 8, gamePieceAppearance.transform.position.z],
          rotateX: [
            gamePieceAppearance.transform.rotation.x,
            gamePieceAppearance.transform.rotation.x,
            gamePieceAppearance.transform.initialRotation?.x ?? 0,
            gamePieceAppearance.transform.initialRotation?.x ?? 0,
          ],
          rotateY: [
            gamePieceAppearance.transform.rotation.y,
            gamePieceAppearance.transform.rotation.y,
            gamePieceAppearance.transform.initialRotation?.y ?? 0,
            gamePieceAppearance.transform.initialRotation?.y ?? 0,
          ],
          rotateZ: [
            gamePieceAppearance.transform.rotation.z,
            gamePieceAppearance.transform.rotation.z,
            gamePieceAppearance.transform.initialRotation?.z ?? 0,
            gamePieceAppearance.transform.initialRotation?.z ?? 0,
          ],
        }}
        transition={{ ease: "anticipate", times: [0, 0.05, 0.8, 1], duration: 0.8 }}
        initial={{
          x: gamePieceAppearance.transform.initialPosition?.x,
          y: gamePieceAppearance.transform.initialPosition?.y,
          z: gamePieceAppearance.transform.initialPosition?.z,
        }}
        scale={(hovered || dragging) && (options?.showHoverAnimation ?? true) ? 1.15 : 1}
        rotation={[
          rotationOverride?.x ?? gamePieceAppearance.transform.rotation?.x,
          rotationOverride?.y ?? gamePieceAppearance.transform.rotation?.y,
          rotationOverride?.z ?? gamePieceAppearance.transform.rotation?.z,
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
