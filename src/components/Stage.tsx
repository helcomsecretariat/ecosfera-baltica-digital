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
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, type: "anticipate" }}
                opacity={1}
                map={isPositive ? positiveTexture : negativeTexture}
              />
            </mesh>
          </motion.group>
        )}
      </AnimatePresence>
      {state.stage !== undefined && (
        <Html wrapperClass="top-10" position={[0, -2.5 * cardHeight, 0]} transform scale={8}>
          <div className="flex flex-col items-center justify-center">
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
              className="w-auto bg-[#0087BE] px-12 text-white hover:bg-[#0087BE]/80"
            >
              {state.stage.terminationEvent ? t("stageEventText.newGame") : t("stageEventText.ok")}
            </Button>
          </div>
        </Html>
      )}
    </>
  );
};

export default Stage;
