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
        x: gamePieceAppearance.transform.initialPosition?.x ?? gamePieceAppearance.transform.position.x,
        y: gamePieceAppearance.transform.initialPosition?.y ?? gamePieceAppearance.transform.position.y,
        z: gamePieceAppearance.transform.initialPosition?.z ?? gamePieceAppearance.transform.position.z,
        rotateX: gamePieceAppearance.transform.initialRotation?.x ?? gamePieceAppearance.transform.rotation.x,
        rotateY: gamePieceAppearance.transform.initialRotation?.y ?? gamePieceAppearance.transform.rotation.y,
        rotateZ: gamePieceAppearance.transform.initialRotation?.z ?? gamePieceAppearance.transform.rotation.z,
      }}
      animate={{
        x: gamePieceAppearance.transform.position.x,
        y: gamePieceAppearance.transform.position.y,
        z: gamePieceAppearance.transform.position.z,
        rotateX: gamePieceAppearance.transform.rotation.x,
        rotateY: gamePieceAppearance.transform.rotation.y,
        rotateZ: gamePieceAppearance.transform.rotation.z,
      }}
    >
      {children}
    </motion.group>
  );
};

export default GamePieceGroup;
