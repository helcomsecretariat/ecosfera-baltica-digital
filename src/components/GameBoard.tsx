import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import Deck from "./Deck";
import Card from "./Card";

function GameBoard() {
  const aspect = 16 / 10;
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { showGrid, gridDivisions, orbitControls } = useControls({
    showGrid: true,
    gridDivisions: 16,
    orbitControls: false,
  });
  const [cards,setCards] = useState<Array<{ x: number, y: number }>>([]);

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
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#171717]">
      <Canvas
        className="relative"
        style={{ width: size.width, height: size.height }}
      >
        <color attach="background" args={["#171717"]} />
        {showGrid && <Grid divisions={gridDivisions} />}
        {cards.map((card, index) => <Card key={index} x={card.x} y={card.y} />)}
        <Deck x={-50} y={37.5} color={"lightblue"} name="Animals" onClick={({x, y}: {x: number, y: number}) => {setCards([...cards, {x, y}])}} />
        <Deck x={-50} y={7.5} color={"lightgreen"} name="Plants" onClick={({x, y}: {x: number, y: number}) => {setCards([...cards, {x, y}])}} />
        <PerspectiveCamera makeDefault position={[0, 0, cameraZoom]} />
        {orbitControls && <OrbitControls />}
      </Canvas>
    </div>
  );
}

export default GameBoard;
