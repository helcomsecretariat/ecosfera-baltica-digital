import { Button } from "@/components/ui/button";
import { upperXBoundary, lowerXBoundary, upperYBoundary, lowerYBoundary } from "@/constants/gameBoard";
import { useGameState } from "@/context/game-state/hook";
import { Html } from "@react-three/drei";
import { cardHeight } from "@/constants/card";
import { motion } from "framer-motion-3d";
import { getAssetPath } from "./utils";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { useSelector } from "@xstate/react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { selectIsPositiveStageEvent, selectStageEventText } from "@/state/machines/selectors";

const Stage = () => {
  const { emit, state, test, actorRef } = useGameState();
  const eventText = useSelector(actorRef, selectStageEventText);
  const isPositive = useSelector(actorRef, selectIsPositiveStageEvent);
  const positiveTextureImageUrl = getAssetPath("stage", "positive");
  const negativeTextureImageUrl = getAssetPath("stage", "negative");
  const positiveTexture = useSRGBTexture(positiveTextureImageUrl);
  const negativeTexture = useSRGBTexture(negativeTextureImageUrl);
  const { t } = useTranslation();

  return (
    <>
      <AnimatePresence>
        {state.stage !== undefined && (
          <motion.group>
            <mesh position={[0, 0, 20]} onPointerOver={(e) => e.stopPropagation()}>
              <planeGeometry args={[upperXBoundary - lowerXBoundary + 5, upperYBoundary - lowerYBoundary, 1]} />
              <motion.meshPhysicalMaterial
                transparent
                initial={{ opacity: 0 }}
                animate={{ opacity: state.stage?.terminationEvent ? 1 : 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, type: "anticipate" }}
                opacity={state.stage.terminationEvent ? 1 : 0.7}
                map={isPositive ? positiveTexture : negativeTexture}
              />
            </mesh>
          </motion.group>
        )}
      </AnimatePresence>
      {state.stage !== undefined && (
        <Html wrapperClass="top-10" position={[0, -2.5 * cardHeight, 0]} transform scale={8}>
          <h1 className="mb-8 whitespace-pre-wrap text-center text-xl text-white">{eventText}</h1>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (state.stage?.terminationEvent) {
                window.location.reload();
                return;
              }
              emit.stageConfirm()();
            }}
            disabled={!test.stageConfirm()}
            variant="default"
            className="w-full"
          >
            {state.stage.terminationEvent ? t("stageEventText.newGame") : t("stageEventText.ok")}
          </Button>
        </Html>
      )}
    </>
  );
};

export default Stage;
