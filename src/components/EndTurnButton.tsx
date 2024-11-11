import { useGameState } from "@/context/game-state/hook";
import { motion } from "framer-motion-3d";
import { lowerYBoundary, upperXBoundary } from "@/constants/gameBoard";
import { Html } from "@react-three/drei";
import { toVector3 } from "@/utils/3d";

const EndTurnButton = () => {
  const { emit } = useGameState();
  const position = {
    x: upperXBoundary - 15,
    y: lowerYBoundary,
    z: 0,
  };
  const rotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  return (
    <motion.mesh position={toVector3(position)} rotation={toVector3(rotation)}>
      <planeGeometry />
      <meshPhysicalMaterial transparent opacity={5} />
      <Html transform scale={7} occlude>
        <button
          className="flex w-full items-center bg-[#0087BE] py-2 pl-8 pr-6 text-white transition-all hover:bg-[#075e81]"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%)",
            WebkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%)",
          }}
          onClick={emit.playerEndTurnClick()}
        >
          End Turn
        </button>
      </Html>
    </motion.mesh>
  );
};

export default EndTurnButton;
