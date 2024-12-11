import { useGameState } from "@/context/game-state/hook";
import { motion } from "framer-motion-3d";
import { lowerYBoundary, upperXBoundary } from "@/constants/gameBoard";
import { Html } from "@react-three/drei";
import { toVector3 } from "@/utils/3d";
import i18n from "@/i18n";

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
      <meshPhysicalMaterial transparent opacity={0} />
      <Html transform scale={7} wrapperClass="bg-transparent" className="border-0 bg-transparent">
        <button
          className="flex w-full items-center bg-[#0087BE] py-2 pl-8 pr-6 text-white transition-all hover:bg-[#0087BE]/80"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 15px 100%)",
            WebkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 15px 100%)",
          }}
          onClick={emit.playerEndTurnClick()}
        >
          {i18n.t("endTurnButton.endTurn")}
        </button>
      </Html>
    </motion.mesh>
  );
};

export default EndTurnButton;
