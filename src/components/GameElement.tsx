import { ReactNode, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion-3d";
import { GamePiece, GamePieceAppearance } from "@/state/types";
import { MeshProps, ThreeEvent, useFrame } from "@react-three/fiber";
import { useGameState } from "@/context/game-state/hook";
import { usePresence } from "framer-motion";
import { useAnimControls } from "@/hooks/useAnimationControls";
import { calculateDurations } from "@/state/utils";

type GameElementProps = {
  // TODO: why do we need width and height?
  height?: number;
  width?: number;
  onClick?: () => void;
  children: ReactNode;
  withFloatAnimation?: boolean;
} & (
  | {
      gamePieceAppearance: GamePieceAppearance;
      cardUID?: never;
    }
  | {
      cardUID: GamePiece["uid"];
      gamePieceAppearance?: never;
    }
);

const GameElement = ({
  gamePieceAppearance,
  onClick,
  children,
  cardUID,
  withFloatAnimation = false,
}: GameElementProps) => {
  const { uiState } = useGameState();
  const appearance = cardUID ? uiState.cardPositions[cardUID] : gamePieceAppearance;
  const [isPresent, safeToRemove] = usePresence();
  const isDisappearing = !appearance.position;
  const zCoord = appearance.position?.z ?? 0;

  const { animSpeed, ease } = useAnimControls();
  const ref = useRef<MeshProps>(null);

  const { mainDuration, mainDelay, zDelay, zDuration, flipDuration, flipDelay, totalDuration } = calculateDurations(
    appearance,
    animSpeed,
  );

  useEffect(() => {
    if (!isPresent) {
      setTimeout(safeToRemove, totalDuration);
    }
  }, [isPresent, safeToRemove, totalDuration]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!isDisappearing && onClick) onClick();
    },
    [isDisappearing, onClick],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const waveSpeed = 0.6;
    const waveAmplitude = 3.2;
    const maxRotationY = Math.PI / 12;
    const maxRotationZ = Math.PI / 64;
    const phaseOffset = (appearance.position?.x ?? 0) * 0.1;

    if (withFloatAnimation && ref.current && ref.current.position) {
      const mesh = ref.current;

      const rotationY = Math.cos(time * waveSpeed + phaseOffset) * maxRotationY;
      const rotationZ = Math.sin(time * waveSpeed + phaseOffset) * maxRotationZ;

      // @ts-expect-error dunno why..
      mesh.position.z = (appearance.position?.z ?? 0) + Math.sin(time * waveSpeed + phaseOffset) * waveAmplitude;
      // @ts-expect-error dunno why..
      mesh.rotation.y = appearance.rotation.y + rotationY;
      // @ts-expect-error dunno why..
      mesh.rotation.z = appearance.rotation.z + rotationZ;
    }
  });

  return (
    <motion.mesh
      ref={ref}
      onClick={handleClick}
      position-z={zCoord}
      transition={{
        ease,
        duration: mainDuration,
        delay: mainDelay,
        rotateY: {
          duration: flipDuration,
          delay: flipDelay,
        },
        z: {
          delay: zDelay,
          duration: zDuration,
          times: [0, 0.1, 0.3, 1],
        },
        scale: {
          delay: 0,
        },
      }}
      animate={{
        x: appearance.position?.x,
        y: appearance.position?.y,
        z: zCoord > 8 ? zCoord : [zCoord, 8, 8, zCoord],
        rotateX: appearance.rotation?.x,
        rotateY: appearance.rotation?.y,
        rotateZ: appearance.rotation?.z,
      }}
      initial={{
        x: appearance.initialPosition?.x,
        y: appearance.initialPosition?.y,
        z: appearance.initialPosition?.z,
        rotateX: appearance.initialRotation?.x,
        rotateY: appearance.initialRotation?.y,
        rotateZ: appearance.initialRotation?.z,
      }}
      exit={{
        x: appearance.exitPosition?.x,
        y: appearance.exitPosition?.y,
        z: appearance.exitPosition?.z,
        rotateX: appearance.exitRotation?.x,
        rotateY: appearance.exitRotation?.y,
        rotateZ: appearance.exitRotation?.z,
      }}
      whileHover={{ scale: onClick ? 1.05 : 1 }}
    >
      {children}
    </motion.mesh>
  );
};

export default GameElement;
