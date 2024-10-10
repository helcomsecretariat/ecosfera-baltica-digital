import { ReactNode, useRef, useState } from "react";
import { motion } from "framer-motion-3d";
import { Coordinate, GamePieceAppearance } from "@/state/types";
import { MeshProps } from "@react-three/fiber";
import { useControls } from "leva";
import { baseDuration, cardFlipDuration } from "@/constants/animation";
import { cubicBezier, reverseEasing } from "framer-motion";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

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
  key?: string;
};

const GameElement = ({
  gamePieceAppearance,
  options = {
    draggable: true,
    showHoverAnimation: true,
  },
  onClick,
  children,
}: GameElementProps) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const { duration, ease } = useControls({
    duration: {
      value: baseDuration,
      min: 0.1,
      max: 4,
      step: 0.05,
    },
    ease: {
      options: [
        "linear",
        "easeIn",
        "easeOut",
        "easeInOut",
        "circIn",
        "circOut",
        "circInOut",
        "backIn",
        "backOut",
        "backInOut",
        "anticipate",
      ],
      value: "backOut",
    },
  });
  const ref = useRef<MeshProps>(null);
  const thisDuration = (duration * gamePieceAppearance.duration) / baseDuration;
  const thisDelay = gamePieceAppearance.delay;

  return (
    // <DragControls
    //   dragLimits={[
    //     [
    //       lowerXBoundary + gamePieceAppearance.transform.position.x * -1 + width / 2,
    //       upperXBoundary + gamePieceAppearance.transform.position.x * -1 - width / 2,
    //     ],
    //     [
    //       lowerYBoundary + gamePieceAppearance.transform.position.y * -1 + height / 2,
    //       upperYBoundary + gamePieceAppearance.transform.position.y * -1 - height / 2,
    //     ],
    //     [0, 0],
    //   ]}
    //   dragConfig={{ enabled: options?.draggable ?? true }}
    //   onDragStart={() => setDragging(true)}
    //   onDragEnd={() => handleDragEnd()}
    //   autoTransform
    // >
    <motion.mesh
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      position-z={gamePieceAppearance.transform.position?.z}
      transition={{
        ease,
        duration: thisDuration,
        delay: thisDelay,
        rotateY: {
          duration: cardFlipDuration,
          delay: thisDuration + thisDelay,
        },
        z: {
          duration: thisDuration + cardFlipDuration * 2,
          delay: thisDelay,
        },
      }}
      animate={{
        x: gamePieceAppearance.transform.position?.x,
        y: gamePieceAppearance.transform.position?.y,
        z: [gamePieceAppearance.transform.position?.z, 8, 8, gamePieceAppearance.transform.position?.z],
        rotateX: gamePieceAppearance.transform.rotation?.x,
        rotateY: gamePieceAppearance.transform.rotation?.y,
        rotateZ: gamePieceAppearance.transform.rotation?.z,
      }}
      initial={{
        x: gamePieceAppearance.transform.initialPosition?.x,
        y: gamePieceAppearance.transform.initialPosition?.y,
        z: gamePieceAppearance.transform.initialPosition?.z,
        rotateX: gamePieceAppearance.transform.initialRotation?.x,
        rotateY: gamePieceAppearance.transform.initialRotation?.y,
        rotateZ: gamePieceAppearance.transform.initialRotation?.z,
      }}
      exit={{
        x: gamePieceAppearance.transform.exitPosition?.x,
        y: gamePieceAppearance.transform.exitPosition?.y,
        z: gamePieceAppearance.transform.exitPosition?.z,
        rotateX: gamePieceAppearance.transform.exitRotation?.x,
        rotateY: gamePieceAppearance.transform.exitRotation?.y,
        rotateZ: gamePieceAppearance.transform.exitRotation?.z,
      }}
      scale={hovered && (options?.showHoverAnimation ?? true) ? 1.15 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {children}
    </motion.mesh>
    // </DragControls>
  );
};

export default GameElement;
