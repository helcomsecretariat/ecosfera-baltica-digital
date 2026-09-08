import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera, Preload } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import Croupier from "./Croupier";
import { Stats } from "@react-three/drei";
import { Leva } from "leva";
import { useBlocker } from "@/hooks/useBlocker";
import { MaterialProvider } from "@/components/MaterialProvider/provider";
import { useTestControls } from "@/hooks/useTestControls";
import Menu from "./Menu";
import { SRGBColorSpace } from "three";
import { useExpPackControls } from "@/hooks/useExpPackControls";
import { useDebugMode } from "@/hooks/useDebugMode";

// Renders nothing; mounts only once the surrounding suspense boundary has resolved,
// signalling that the scene is ready to be revealed.
function SceneReady({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

export default function GameBoard({ onSceneReady }: { onSceneReady?: () => void }) {
  const isDebugMode = useDebugMode();
  useBlocker();
  useTestControls();
  useExpPackControls();

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
      <Canvas
        shadows
        className="relative"
        style={{ width: size.width, height: size.height }}
        gl={{ outputColorSpace: SRGBColorSpace }}
      >
        <Suspense fallback={null}>
          <MaterialProvider isGlossy={false}>
            <ambientLight intensity={3} />
            <directionalLight position={[0, 0, cameraZoom]} intensity={0.5} />

            {showGrid && <Grid divisions={gridDivisions} />}
            <PerspectiveCamera makeDefault position={[0, 0, cameraZoom]} />
            {orbitControls && <OrbitControls />}
            <Croupier />

            {FPS && <Stats />}

            <Preload all />
            <SceneReady onReady={onSceneReady} />
          </MaterialProvider>
        </Suspense>
      </Canvas>
      <div className="absolute left-[20%] top-0 z-[2]">
        <Leva collapsed flat hideCopyButton fill hidden={!isDebugMode} />
      </div>
    </div>
  );
}
