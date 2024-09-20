import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import Market from "./Market";
import { spawnDeck } from "~/state/game-state";
import deckConfig from "~/decks/ecosfera-baltica.deck.json";

function GameBoard() {
  //@ts-expect-error TS can infer enums from JSON files. Deck validation is done in the schema
  const deck = useMemo(() => spawnDeck(deckConfig), []);
  useEffect(() => {
    console.log(deck);
  }, [deck]);

  const aspect = 3 / 2;
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { showGrid, gridDivisions, orbitControls } = useControls({
    showGrid: false,
    gridDivisions: 16,
    orbitControls: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth, 2000);
      const height = width / aspect;
      setSize({ width, height });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [aspect]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[white]">
      <Canvas
        className="relative"
        style={{ width: size.width, height: size.height }}
      >
        <color attach="background" args={["#B2D0CE"]} />
        {showGrid && <Grid divisions={gridDivisions} />}
        <PerspectiveCamera makeDefault position={[0, 0, cameraZoom]} />
        {orbitControls && <OrbitControls />}
        <Market />
      </Canvas>
    </div>
  );
}

export default GameBoard;
