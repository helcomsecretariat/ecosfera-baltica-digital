import { GamePieceAppearance } from "@/state/types";
import { motion } from "framer-motion-3d";
import { ReactNode } from "react";

type GamePieceGroupProps = {
  gamePieceAppearance: GamePieceAppearance;
  children: ReactNode;
};
const GamePieceGroup = ({ gamePieceAppearance, children }: GamePieceGroupProps) => {
  return (
    <motion.group
      initial={{
        ...gamePieceAppearance.initialPosition,
        rotateX: gamePieceAppearance.initialRotation?.x,
        rotateY: gamePieceAppearance.initialRotation?.y,
        rotateZ: gamePieceAppearance.initialRotation?.z,
      }}
      animate={{
        ...gamePieceAppearance.position,
        rotateX: gamePieceAppearance.rotation?.x,
        rotateY: gamePieceAppearance.rotation?.y,
        rotateZ: gamePieceAppearance.rotation?.z,
      }}
    >
      {children}
    </motion.group>
  );
};

export default GamePieceGroup;
