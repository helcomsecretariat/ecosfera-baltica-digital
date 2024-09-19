import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import Market from "./Market";
import PlayerCards from "./PlayerCards";
import ExtinctionTiles from "./ExtinctionTiles";
import BiomeTiles from "./BiomeTiles";
import { v4 as uuid } from "uuid";

const animals = [
  { name: "Calanoida", id: uuid() },
  { name: "Rotifera", id: uuid() },
  { name: "Clangula hyemalis", id: uuid() },
  { name: "Haliaeetus albicilla", id: uuid() },
  { name: "Anguilla anguilla", id: uuid() },
  { name: "Pusa hispida", id: uuid() },
  { name: "Lutra lutra", id: uuid() },
  { name: "Larus fuscus", id: uuid() },
  { name: "Somateria mollissima", id: uuid() },
  { name: "Platichthys flesus", id: uuid() },
  { name: "Haematopus ostralegus", id: uuid() },
  { name: "Halichoerus grypus", id: uuid() },
  { name: "Gasterosteus aculeatus", id: uuid() },
  { name: "Squalus acanthias", id: uuid() },
  { name: "Phocoena phocoena", id: uuid() },
  { name: "Gadus morhua", id: uuid() },
  { name: "Protists", id: uuid() },
  { name: "Clupea harengus", id: uuid() },
  { name: "Alca torda", id: uuid() },
  { name: "Mergus merganser", id: uuid() },
  { name: "Mytilus edulis", id: uuid() },
  { name: "Salmo salar", id: uuid() },
  { name: "Idotea baltica", id: uuid() },
  { name: "Acipenser oxyrinchus", id: uuid() },
  { name: "Myoxocephalus quadricornis", id: uuid() },
  { name: "Perca fluviatilis", id: uuid() },
  { name: "Esox lucius", id: uuid() },
  { name: "Saduria entomon", id: uuid() },
  { name: "Cygnus olor", id: uuid() },
  { name: "Macoma balthic", id: uuid() },
];
const plants = [
  { name: "Myriophyllum spicatum", id: uuid() },
  { name: "Potamogeton perfoliatus", id: uuid() },
  { name: "Chrysochomulina", id: uuid() },
  { name: "Ascophyllym nodosum", id: uuid() },
  { name: "Synechococcus", id: uuid() },
  { name: "Ruppia spp.", id: uuid() },
  { name: "Najas marina", id: uuid() },
  { name: "Fragmites australis", id: uuid() },
  { name: "Fucus vesiculosus", id: uuid() },
  { name: "Cladophora glomerata", id: uuid() },
  { name: "Planothidium spp.", id: uuid() },
  { name: "Pilayella littoralis", id: uuid() },
  { name: "Zostera marina", id: uuid() },
  { name: "Biecheleria baltica", id: uuid() },
  { name: "Pauliella taeniata", id: uuid() },
  { name: "Ulva lactuta", id: uuid() },
  { name: "Chara ssp.", id: uuid() },
  { name: "Mesodinium rubrum", id: uuid() },
  { name: "Nodularia spumigena", id: uuid() },
  { name: "Aphanizomenon flosaquae", id: uuid() },
  { name: "Furcellaria lumbricalis", id: uuid() },
  { name: "Oocystis borgei", id: uuid() },
  { name: "Zanichellia palustris", id: uuid() },
  { name: "Skeletonema marinoi", id: uuid() },
  { name: "Vertebrata lanosa", id: uuid() },
  { name: "Bacteria", id: uuid() },
  { name: "Nitzschia filifomis", id: uuid() },
  { name: "Ceramium tenuicorne", id: uuid() },
  { name: "Fontinalis antipyretica", id: uuid() },
  { name: "Viruses", id: uuid() },
];

function GameBoard() {
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

  const gameState = {
    player: [],
    plantMarket: {
      deck: plants.slice(4, plants.length),
      table: plants.slice(0, 4),
    },
    animalMarket: {
      deck: animals.slice(4, animals.length),
      table: animals.slice(0, 4),
    },
    elementMarket: { deck: [], table: [] },
    disasterMarket: { deck: [], table: [] },
  };

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth, 3000);
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
        <Market gameState={gameState} />
        <PlayerCards />
        <ExtinctionTiles />
        <BiomeTiles />
      </Canvas>
    </div>
  );
}

export default GameBoard;
