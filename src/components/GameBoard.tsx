import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera, Preload } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import Croupier from "./Croupier";
import PreloadAssets from "@/components/PreloadAssets";
import { DeckConfig } from "@/decks/schema";
import { Stats } from "@react-three/drei";
import { Leva } from "leva";
import { useBlocker } from "@/hooks/useBlocker";
import { MaterialProvider } from "@/components/MaterialProvider/provider";
import { useTestControls } from "@/hooks/useTestControls";
import Menu from "./Menu";

export default function GameBoard() {
  useBlocker();
  useTestControls();

  const { showGrid, gridDivisions, orbitControls, FPS } = useControls({
    showGrid: false,
    gridDivisions: 16,
    orbitControls: false,
    FPS: false,
  });

  const aspect = 3 / 2;
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth, 3000);
      const height = width / aspect;
      setSize({ width, height });
    };

    window.addEventListener("resize", handleResize);
    screen.orientation.addEventListener("change", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      screen.orientation.removeEventListener("change", handleResize);
    };
  }, [aspect]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Menu />
      <Canvas shadows className="relative" style={{ width: size.width, height: size.height }}>
        <Suspense fallback={null}>
          <MaterialProvider isGlossy={false}>
            <ambientLight intensity={3} />
            <directionalLight position={[0, 0, cameraZoom]} intensity={0.5} />

            {showGrid && <Grid divisions={gridDivisions} />}
            <PerspectiveCamera makeDefault position={[0, 0, cameraZoom]} />
            {orbitControls && <OrbitControls />}
            <Croupier />

            {FPS && <Stats />}

            <PreloadAssets config={deckConfig as unknown as DeckConfig} />
            <Preload all />
          </MaterialProvider>
        </Suspense>
      </Canvas>
      <div className="absolute left-1/2 top-0 z-[2] -translate-x-1/2">
        <Leva collapsed flat hideCopyButton fill />
      </div>
    </div>
  );
}
