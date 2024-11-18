import { AnimalCard, PlantCard } from "@/state/types";
import { useGameState } from "@/context/game-state/hook";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useSelector } from "@xstate/react";
import { MachineSelectors } from "@/state/machines/selectors";
import { find } from "lodash";
import { cardHeight, cardWidth } from "@/constants/card";
import { motion } from "framer-motion-3d";

const CardAbilityTokens = ({ card }: { card: AnimalCard | PlantCard }) => {
  const { emit, actorRef } = useGameState();
  const usedAbilities = useSelector(actorRef, MachineSelectors.usedAbilities);
  const currentAbility = useSelector(actorRef, MachineSelectors.currentAbility);

  const plusTexture = useSRGBTexture("/ecosfera_baltica/ability_plus.avif");
  const refreshTexture = useSRGBTexture("/ecosfera_baltica/ability_refresh.avif");
  const moveTexture = useSRGBTexture("/ecosfera_baltica/ability_move.avif");
  const specialTexture = useSRGBTexture("/ecosfera_baltica/ability_special.avif");

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
            map={
              name === "move"
                ? moveTexture
                : name === "plus"
                  ? plusTexture
                  : name === "special"
                    ? specialTexture
                    : refreshTexture
            }
          />
        </motion.mesh>
      );
    })
  );
};

export default CardAbilityTokens;
