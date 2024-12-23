import { AnimalCard, PlantCard } from "@/state/types";
import { useGameState } from "@/context/game-state/hook";
import { useSelector } from "@xstate/react";
import { find } from "lodash";
import { cardHeight, cardWidth } from "@/constants/card";
import { motion } from "framer-motion-3d";
import useAbilityTextures from "@/hooks/useAbilityTextures";
import { selectCurrentAbility, selectUsedAbilities } from "@/state/machines/selectors";

const CardAbilityTokens = ({ card }: { card: AnimalCard | PlantCard }) => {
  const { emit, actorRef } = useGameState();
  const usedAbilities = useSelector(actorRef, selectUsedAbilities);
  const currentAbility = useSelector(actorRef, selectCurrentAbility);

  const abilityTextures = useAbilityTextures().fullSize;

  return (
    !find(usedAbilities, { source: card.uid }) &&
    card.abilities.map((name, index) => {
      return (
        <motion.mesh
          key={`${card.uid}_${name}_ability`}
          onHoverStart={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.25 }}
          onClick={emit.cardTokenClick(card, name)}
          position={[index === 0 ? 0 : cardWidth * (index === 1 ? -0.35 : 0.35), cardHeight * 0.65, 0]}
        >
          <circleGeometry args={[1.8, 32]} />
          <meshBasicMaterial
            color={currentAbility?.piece?.uid !== card.uid || currentAbility?.name !== name ? "white" : "#1D86BC"}
            map={abilityTextures[name]}
          />
        </motion.mesh>
      );
    })
  );
};

export default CardAbilityTokens;
