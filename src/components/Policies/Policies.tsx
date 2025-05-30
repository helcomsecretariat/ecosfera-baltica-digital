import { useGameState } from "@/context/game-state/hook";
import { PolicyCard as PolicyCardType } from "@/state/types";
import { motion } from "framer-motion-3d";
import { lowerXBoundary, lowerYBoundary, upperXBoundary, upperYBoundary } from "@/constants/gameBoard";
import PolicyCard from "./PolicyCard";
import { Html } from "@react-three/drei";
import FundingCard from "./FundingCard";
import { AnimatePresence } from "framer-motion";
import i18n from "@/i18n";

const Policies = () => {
  const { state, emit, test, showPolicies, setShowPolicies, guards } = useGameState();

  return (
    <AnimatePresence>
      {showPolicies && (
        <motion.mesh
          onClick={(e) => {
            e.stopPropagation();
            setShowPolicies(false);
          }}
          onPointerOver={(e) => e.stopPropagation()}
          key="policies"
          position={[0, 0, 8]}
          initial={{ y: -200 }}
          animate={{ y: 0 }}
          exit={{ y: -200 }}
        >
          <planeGeometry args={[upperXBoundary - lowerXBoundary * 2, upperYBoundary - lowerYBoundary * 2, 1]} />
          <meshBasicMaterial color="#052B4E" transparent opacity={0.9} />
          <Html position={[0, 48, 1]} transform scale={7}>
            <h1 className="font-light text-white">{i18n.t("policies.active")}</h1>
          </Html>
          <Html position={[0, 15, 1]} transform scale={7}>
            <h1 className="font-light text-white">{i18n.t("policies.acquired")}</h1>
          </Html>
          <Html position={[0, -25, 1]} transform scale={7}>
            <h1 className="font-light text-white">{i18n.t("policies.funding")}</h1>
          </Html>
          {state.policyMarket.table.map((card: PolicyCardType) => (
            <PolicyCard
              key={card.uid}
              card={card}
              isActive={guards.isPolicyCardActive(card.name)}
              allowActivation={false}
            />
          ))}
          {state.policyMarket.funding.map((card: PolicyCardType) => (
            <FundingCard key={card.uid} cardUid={card.uid} />
          ))}
          {state.policyMarket.acquired.map((card: PolicyCardType) => (
            <PolicyCard
              key={card.uid}
              card={card}
              onClick={emit.acquiredPolicyCardClick(card)}
              isActive={false}
              allowActivation={test.acquiredPolicyCardClick(card)}
            />
          ))}
        </motion.mesh>
      )}
    </AnimatePresence>
  );
};

export default Policies;
