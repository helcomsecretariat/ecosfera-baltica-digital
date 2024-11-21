import { lowerXBoundary, upperXBoundary, upperYBoundary } from "@/constants/gameBoard";
import { useGameState } from "@/context/game-state/hook";
import { motion } from "framer-motion-3d";
import { Text } from "@react-three/drei";

const CommandBar = () => {
  const { state } = useGameState();

  return (
    state.commandBar && (
      <motion.mesh position={[0, upperYBoundary - 10, 8]}>
        <planeGeometry args={[upperXBoundary - lowerXBoundary * 0.5, 10, 1]} />
        <meshBasicMaterial color="#0e1d36" />
        <Text position={[0, 0, 0]} fontSize={4} color="white">
          {state.commandBar.text}
        </Text>
      </motion.mesh>
    )
  );
};

export default CommandBar;
