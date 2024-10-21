import { useGameState } from "@/context/GameStateProvider";
import { motion } from "framer-motion-3d";
import { baseDuration } from "@/constants/animation";
import { useAnimControls } from "@/hooks/useAnimationControls";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";

const positions = [
  { x: 65, y: -37, z: 0 },
  { x: 65, y: 37, z: 0 },
  { x: -65, y: 37, z: 0 },
  { x: -65, y: -37, z: 0 },
];
const rotations = [
  { rotateX: 0, rotateY: 0, rotateZ: Math.PI / 2 },
  { rotateX: 0, rotateY: 0, rotateZ: Math.PI },
  { rotateX: 0, rotateY: 0, rotateZ: -Math.PI / 2 },
  { rotateX: 0, rotateY: 0, rotateZ: 0 },
];

export const NextButton = () => {
  const {
    emit,
    state: { turn, players },
  } = useGameState();
  const texture = useSRGBTexture("/ecosfera_baltica/next_turn.avif");
  const index = players.findIndex((player) => player.uid === turn.player);
  const { ease, animSpeed } = useAnimControls();
  const duration = (2 / animSpeed) * baseDuration * 400;

  return (
    <motion.mesh
      key={"next-turn" + index}
      onClick={emit.playerEndTurnClick()}
      initial={{ ...positions[index], ...rotations[index], scale: 0.2 }}
      animate={{ ...positions[index], ...rotations[index], scale: 1 }}
      exit={{ ...positions[index], ...rotations[index], scale: 0.2 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ ease, duration }}
    >
      <circleGeometry args={[5, 16]} />
      <motion.meshBasicMaterial
        map={texture}
        color="white"
        transparent
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      />
    </motion.mesh>
  );
};
