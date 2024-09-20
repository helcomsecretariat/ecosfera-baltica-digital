import { useEffect, useMemo, useState } from "react";
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
import { spawnDeck } from "~/state/game-state";
import deckConfig from "~/decks/ecosfera-baltica.deck.json";

const animals = [
  { name: "Calanoida", id: uuid() },
  { name: "Rotifera", id: uuid() },
  { name: "Clangula\n hyemalis", id: uuid() },
  { name: "Haliaeetus\n albicilla", id: uuid() },
  { name: "Anguilla\n anguilla", id: uuid() },
  { name: "Pusa\n hispida", id: uuid() },
  { name: "Lutra\n lutra", id: uuid() },
  { name: "Larus\n fuscus", id: uuid() },
  { name: "Somateria\n mollissima", id: uuid() },
  { name: "Platichthys\n flesus", id: uuid() },
  { name: "Haematopus\n ostralegus", id: uuid() },
  { name: "Halichoerus\n grypus", id: uuid() },
  { name: "Gasterosteus\n aculeatus", id: uuid() },
  { name: "Squalus\n acanthias", id: uuid() },
  { name: "Phocoena\n phocoena", id: uuid() },
  { name: "Gadus\n morhua", id: uuid() },
  { name: "Protists", id: uuid() },
  { name: "Clupea\n harengus", id: uuid() },
  { name: "Alca\n torda", id: uuid() },
  { name: "Mergus\n merganser", id: uuid() },
  { name: "Mytilus\n edulis", id: uuid() },
  { name: "Salmo\n salar", id: uuid() },
  { name: "Idotea\n baltica", id: uuid() },
  { name: "Acipenser\n oxyrinchus", id: uuid() },
  { name: "Myoxocephalus\n quadricornis", id: uuid() },
  { name: "Perca\n fluviatilis", id: uuid() },
  { name: "Esox\n lucius", id: uuid() },
  { name: "Saduria\n entomon", id: uuid() },
  { name: "Cygnus\n olor", id: uuid() },
  { name: "Macoma\n balthic", id: uuid() },
];
const plants = [
  { name: "Myriophyllum\n spicatum", id: uuid() },
  { name: "Potamogeton\n perfoliatus", id: uuid() },
  { name: "Chrysochomulina", id: uuid() },
  { name: "Ascophyllym\n nodosum", id: uuid() },
  { name: "Synechococcus", id: uuid() },
  { name: "Ruppia\n spp.", id: uuid() },
  { name: "Najas\n marina", id: uuid() },
  { name: "Fragmites\n australis", id: uuid() },
  { name: "Fucus\n vesiculosus", id: uuid() },
  { name: "Cladophora\n glomerata", id: uuid() },
  { name: "Planothidium\n spp.", id: uuid() },
  { name: "Pilayella\n littoralis", id: uuid() },
  { name: "Zostera\n marina", id: uuid() },
  { name: "Biecheleria\n baltica", id: uuid() },
  { name: "Pauliella\n taeniata", id: uuid() },
  { name: "Ulva\n lactuta", id: uuid() },
  { name: "Chara\n ssp.", id: uuid() },
  { name: "Mesodinium\n rubrum", id: uuid() },
  { name: "Nodularia\n spumigena", id: uuid() },
  { name: "Aphanizomenon\n flosaquae", id: uuid() },
  { name: "Furcellaria\n lumbricalis", id: uuid() },
  { name: "Oocystis\n borgei", id: uuid() },
  { name: "Zanichellia\n palustris", id: uuid() },
  { name: "Skeletonema\n marinoi", id: uuid() },
  { name: "Vertebrata\n lanosa", id: uuid() },
  { name: "Bacteria", id: uuid() },
  { name: "Nitzschia\n filifomis", id: uuid() },
  { name: "Ceramium\n tenuicorne", id: uuid() },
  { name: "Fontinalis\n antipyretica", id: uuid() },
  { name: "Viruses", id: uuid() },
];
const elements = [
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Sun", id: uuid() };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Oxygen", id: uuid() };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Salinity", id: uuid() };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Nutrients", id: uuid() };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Temperature", id: uuid() };
  }),
];
const disasters = [
  ...Array.from(Array(30).keys()).map((_) => {
    return { name: "Storm", id: uuid() };
  }),
];

export type GameState = {
  animalMarket: {
    deck: { name: string; id: string }[];
    table: { name: string; id: string }[];
  };
  plantMarket: {
    deck: { name: string; id: string }[];
    table: { name: string; id: string }[];
  };
  elementMarket: {
    deck: { name: string; id: string }[];
    table: { name: string; id: string }[];
  };
  disasterMarket: {
    deck: { name: string; id: string }[];
    table: { name: string; id: string }[];
  };
};

function GameBoard() {
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

  const [gameState, setGameState] = useState<GameState>({
    plantMarket: {
      deck: plants.slice(4, plants.length),
      table: plants.slice(0, 4),
    },
    animalMarket: {
      deck: animals.slice(4, animals.length),
      table: animals.slice(0, 4),
    },
    elementMarket: {
      deck: elements,
      table: [],
    },
    disasterMarket: {
      deck: disasters,
      table: [],
    },
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
  }, []);

  const drawCard = (
    id: string,
    type: "animal" | "plant" | "element" | "disaster",
  ) => {
    switch (type) {
      case "animal":
        setGameState({
          ...gameState,
          animalMarket: {
            deck: gameState.animalMarket.deck.filter((card) => card.id !== id),
            table: [
              ...gameState.animalMarket.table,
              gameState.animalMarket.deck.filter((card) => card.id === id)[0],
            ],
          },
        });
        break;
      case "plant":
        setGameState({
          ...gameState,
          plantMarket: {
            deck: gameState.plantMarket.deck.filter((card) => card.id !== id),
            table: [
              ...gameState.plantMarket.table,
              gameState.plantMarket.deck.filter((card) => card.id === id)[0],
            ],
          },
        });
        break;
      case "element":
        setGameState({
          ...gameState,
          elementMarket: {
            deck: gameState.elementMarket.deck.filter((card) => card.id !== id),
            table: [
              ...gameState.elementMarket.table,
              gameState.elementMarket.deck.filter((card) => card.id === id)[0],
            ],
          },
        });
        break;
      case "disaster":
        setGameState({
          ...gameState,
          disasterMarket: {
            deck: gameState.disasterMarket.deck.filter(
              (card) => card.id !== id,
            ),
            table: [
              ...gameState.disasterMarket.table,
              gameState.disasterMarket.deck.filter((card) => card.id === id)[0],
            ],
          },
        });
        break;
    }
  };

  useEffect(() => console.log(gameState), [gameState])

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
        <Market
          gameState={gameState}
          onDraw={(
            id: string,
            type: "animal" | "plant" | "element" | "disaster",
          ) => drawCard(id, type)}
        />
        <PlayerCards />
        <ExtinctionTiles />
        <BiomeTiles />
      </Canvas>
    </div>
  );
}

export default GameBoard;
