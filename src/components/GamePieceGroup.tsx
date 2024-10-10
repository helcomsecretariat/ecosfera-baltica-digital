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
        ...gamePieceAppearance.transform.initialPosition,
        rotateX: gamePieceAppearance.transform.initialRotation?.x,
        rotateY: gamePieceAppearance.transform.initialRotation?.y,
        rotateZ: gamePieceAppearance.transform.initialRotation?.z,
      }}
      animate={{
        ...gamePieceAppearance.transform.position,
        rotateX: gamePieceAppearance.transform.rotation?.x,
        rotateY: gamePieceAppearance.transform.rotation?.y,
        rotateZ: gamePieceAppearance.transform.rotation?.z,
      }}
    >
      {children}
    </motion.group>
  );
};

export default GamePieceGroup;
