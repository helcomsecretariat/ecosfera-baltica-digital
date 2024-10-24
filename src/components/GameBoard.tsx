import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import Croupier from "./Croupier";
import PreloadAssets from "@/components/PreloadAssets";
import { GameStateProvider } from "@/context/GameStateProvider";
import { DeckConfig } from "@/decks/schema";
import { Stats } from "@react-three/drei";
import { Leva } from "leva";
import { debounce } from "lodash";

function GameBoard() {
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
      <PreloadAssets config={deckConfig as DeckConfig} />
      <Canvas shadows className="relative" style={{ width: size.width, height: size.height }}>
        <ambientLight intensity={1.5} />
        {/* <color attach="background" args={["#032C4E"]} /> */}
        {showGrid && <Grid divisions={gridDivisions} />}
        <PerspectiveCamera makeDefault position={[0, 0, cameraZoom]} />
        {orbitControls && <OrbitControls />}
        <Croupier />

        {FPS && <Stats />}
      </Canvas>
      <Leva collapsed flat hideCopyButton />
    </div>
  );
}

export default () => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlSeed = searchParams.get("seed") ?? new Date().toString();

  const { numberOfPlayers, difficulty, seed } = useControls({
    seed: {
      value: urlSeed,
    },
    difficulty: {
      value: 1,
      min: 1,
      max: 6,
      step: 1,
    },
    numberOfPlayers: {
      value: 3,
      min: 1,
      max: 4,
      step: 1,
    },
  });

  const [debouncedKey, setDebouncedKey] = useState("");

  const debouncedSetKey = useMemo(() => debounce((newKey: string) => setDebouncedKey(newKey), 1500), []);

  // Update the key whenever the controls change
  useEffect(() => {
    const newKey = `${numberOfPlayers}-${seed}-${difficulty}`;
    debouncedSetKey(newKey);
  }, [numberOfPlayers, seed, difficulty, debouncedSetKey]);

  return (
    <GameStateProvider
      key={debouncedKey}
      numberOfPlayers={numberOfPlayers}
      seed={seed}
      difficulty={difficulty as 1 | 2 | 3 | 4 | 5 | 6}
    >
      <GameBoard />
    </GameStateProvider>
  );
};
