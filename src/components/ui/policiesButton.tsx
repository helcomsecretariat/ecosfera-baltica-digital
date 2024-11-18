import { upperXBoundary, upperYBoundary } from "@/constants/gameBoard";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion-3d";

const PoliciesButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.mesh key="policies-button" position={[upperXBoundary - 15, upperYBoundary, 1]} rotation={[0, 0, 0]}>
      <planeGeometry />
      <meshPhysicalMaterial transparent opacity={0} />
      <Html transform scale={7} wrapperClass="bg-transparent" className="border-0 bg-transparent">
        <button
          className="flex w-full items-center bg-[#0087BE] py-2 pl-8 pr-6 text-white transition-all hover:bg-[#0087BE]/80"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%)",
            WebkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%)",
          }}
          onClick={onClick}
        >
          Policies
        </button>
      </Html>
    </motion.mesh>
  );
};

export default PoliciesButton;
