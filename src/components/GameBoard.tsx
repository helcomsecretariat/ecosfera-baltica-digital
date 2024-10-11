import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import ExtinctionTiles from "./ExtinctionTiles";
import BiomeTiles from "./BiomeTiles";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import Croupier from "./Croupier";
import { UiState } from "@/state/types";
import PreloadAssets from "@/components/PreloadAssets";
import { GameStateProvider, useGameState } from "@/context/GameStateProvider";
import { DeckConfig } from "@/decks/schema";
import { toUiState } from "@/state/positioner";

function GameBoard() {
  const { showGrid, gridDivisions, orbitControls } = useControls({
    showGrid: false,
    gridDivisions: 16,
    orbitControls: false,
    numberOfPlayers: {
      value: 1,
      min: 1,
      max: 4,
      step: 1,
    },
  });
  const { state } = useGameState();
  const prevUiStateRef = useRef<UiState | null>(null);
  const uiState = useMemo(() => toUiState(prevUiStateRef.current, state), [state]);

  useEffect(() => {
    prevUiStateRef.current = uiState;
  }, [uiState]);

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

        <ExtinctionTiles />
        <BiomeTiles />
      </Canvas>
    </div>
  );
}

export default () => {
  const searchParams = new URLSearchParams(window.location.search);
  const seed = searchParams.get("seed") ?? new Date().toString();
  const { numberOfPlayers } = useControls({
    seed: {
      value: seed,
    },
    numberOfPlayers: {
      value: 3,
      min: 1,
      max: 4,
      step: 1,
    },
  });
  const key = `${numberOfPlayers}-${seed}`;

  return (
    <GameStateProvider key={key} numberOfPlayers={numberOfPlayers} seed={seed}>
      <GameBoard />
    </GameStateProvider>
  );
};
