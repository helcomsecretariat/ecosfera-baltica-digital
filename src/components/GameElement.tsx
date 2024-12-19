import { ReactNode, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion-3d";
import { GamePiece, GamePieceAppearance } from "@/state/types";
import { MeshProps, ThreeEvent, useFrame } from "@react-three/fiber";
import { useGameState } from "@/context/game-state/hook";
import { usePresence } from "framer-motion";
import { ANIM_CONFIG, useAnimControls } from "@/hooks/useAnimationControls";
import { calculateDurations } from "@/state/utils";
import { voidSpaceAppearance } from "@/constants/animation";

type GameElementProps = {
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
  let appearance: GamePieceAppearance | undefined = cardUID ? uiState.cardPositions[cardUID] : gamePieceAppearance;
  const [isPresent, safeToRemove] = usePresence();
  const { animSpeed, ease } = useAnimControls();
  const ref = useRef<MeshProps>(null);
  const floatAnimStartTimeRef = useRef<number | null>(null);

  if (!appearance) {
    console.error("No appearance found for", cardUID);
    appearance = voidSpaceAppearance;
  }

  const isDisappearing = !appearance.position;
  const zCoord = appearance.position?.z ?? appearance.exitPosition?.z ?? 0;

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
    const currentTime = clock.getElapsedTime();

    // Initialize start time when floating animation begins
    if (withFloatAnimation && floatAnimStartTimeRef.current === null) {
      floatAnimStartTimeRef.current = currentTime;
    } else if (!withFloatAnimation) {
      floatAnimStartTimeRef.current = null;
    }

    const time = floatAnimStartTimeRef.current
      ? (currentTime - floatAnimStartTimeRef.current) * (animSpeed / ANIM_CONFIG.initialValue)
      : 0;

    const waveSpeed = 0.6;
    const waveAmplitude = 3.2;
    const maxRotationY = Math.PI / 12;
    const maxRotationZ = Math.PI / 64;
    const rotation = appearance.rotation || appearance.initialRotation;
    const position = appearance.position || appearance.initialPosition;

    if (withFloatAnimation && ref.current && ref.current.position && ref.current.rotation) {
      const rotationY = Math.sin(time * waveSpeed) * maxRotationY;
      const rotationZ = Math.sin(time * (waveSpeed * 1.3)) * maxRotationZ;

      // @ts-expect-error dunno why
      ref.current.position.z = position.z + Math.sin(time * waveSpeed) * waveAmplitude;
      // @ts-expect-error dunno why
      ref.current.rotation.y = rotation.y + rotationY;
      // @ts-expect-error dunno why
      ref.current.rotation.z = rotation.z + rotationZ;
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
        z: zCoord > 8 ? zCoord : [zCoord, 8, 8, zCoord],
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
