import { ReactNode, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion-3d";
import { GamePiece, GamePieceAppearance } from "@/state/types";
import { MeshProps, ThreeEvent } from "@react-three/fiber";
import { baseDuration } from "@/constants/animation";
import { useGameState } from "@/context/GameStateProvider";
import { usePresence } from "framer-motion";
import { useAnimControls } from "@/hooks/useAnimationControls";

type GameElementProps = {
  height: number;
  width: number;
  onClick?: () => void;
  children: ReactNode;
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

const GameElement = ({ gamePieceAppearance, onClick, children, cardUID }: GameElementProps) => {
  const { uiState } = useGameState();
  const appearance = cardUID ? uiState.cardPositions[cardUID] : gamePieceAppearance;
  const [isPresent, safeToRemove] = usePresence();
  const isDisappearing = !appearance.position;
  const zCoord = appearance.position?.z;

  const { animSpeed, ease } = useAnimControls();
  const ref = useRef<MeshProps>(null);
  const mainDuration = (2 / animSpeed) * (appearance.duration / baseDuration);
  const mainDelay = (2 / animSpeed) * (appearance.delay / baseDuration);
  const cardFlipDuration = mainDuration * 0.3;
  const zDuration = mainDuration + cardFlipDuration * 3;
  const flipDuration = appearance.doesFlip ? mainDuration + cardFlipDuration : 0;
  const flipDelay = appearance.doesFlip ? mainDuration + mainDelay : 0;
  const totalDuration = mainDelay + mainDuration + Math.max(mainDelay + zDuration, flipDelay + flipDuration);

  useEffect(() => {
    if (!isPresent) {
      setTimeout(safeToRemove, totalDuration);
    }
  }, [isPresent]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!isDisappearing && onClick) onClick();
    },
    [isDisappearing, onClick],
  );

  return (
    <motion.mesh
      ref={ref}
      onClick={handleClick}
      position-z={zCoord}
      transition={{
        ease,
        duration: Math.max(baseDuration, mainDuration),
        delay: mainDelay,
        rotateY: {
          duration: flipDuration,
          delay: flipDelay,
        },
        z: {
          delay: mainDelay,
          duration: zDuration,
          times: [0, 0.1, 0.3, 1],
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
