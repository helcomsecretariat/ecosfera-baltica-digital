import { useGameState } from "@/context/game-state/hook";
import { PolicyCard as PolicyCardType } from "@/state/types";
import { motion } from "framer-motion-3d";
import { lowerXBoundary, lowerYBoundary, upperXBoundary, upperYBoundary } from "@/constants/gameBoard";
import PolicyCard from "./PolicyCard";
import { Text } from "@react-three/drei";

const Policies = () => {
  const { state, emit } = useGameState();
  return (
    <motion.mesh position={[0, 0, 8]}>
      <planeGeometry args={[upperXBoundary - lowerXBoundary * 0.5, upperYBoundary - lowerYBoundary * 0.6, 1]} />
      <meshBasicMaterial color="#0e1d36" />
      <Text position={[0, 35, 0]} fontSize={3} color="white">
        Funding: {state.policyFunding}
      </Text>
      <Text position={[0, 25, 0]} fontSize={3} color="white">
        Active
      </Text>
      <Text position={[0, -10, 0]} fontSize={3} color="white">
        Acquired
      </Text>
      {state.policyMarket.table.map((card: PolicyCardType) => (
        <PolicyCard
          key={card.uid}
          card={card}
          isExhausted={!state.activePolicyCards.some((policyCard) => policyCard.uid === card.uid)}
        />
      ))}
      {state.policyMarket.acquired.map((card: PolicyCardType) => (
        <PolicyCard key={card.uid} card={card} onClick={() => emit.acquiredPolicyCardClick(card)()} />
      ))}
    </motion.mesh>
  );
};

export default Policies;
