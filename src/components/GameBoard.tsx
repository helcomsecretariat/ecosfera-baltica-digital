import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import ExtinctionTiles from "./ExtinctionTiles";
import BiomeTiles from "./BiomeTiles";
import { v4 as uuid } from "uuid";
import { spawnDeck } from "@/state/game-state";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import Croupier from "./Croupier";
import { shuffle } from "@/state/utils";
import { Card, CardType, Market } from "@/types/general";

const animals: Card[] = [
  { name: "Calanoida", id: uuid(), type: "animal" },
  { name: "Rotifera", id: uuid(), type: "animal" },
  { name: "Clangula\n hyemalis", id: uuid(), type: "animal" },
  { name: "Haliaeetus\n albicilla", id: uuid(), type: "animal" },
  { name: "Anguilla\n anguilla", id: uuid(), type: "animal" },
  { name: "Pusa\n hispida", id: uuid(), type: "animal" },
  { name: "Lutra\n lutra", id: uuid(), type: "animal" },
  { name: "Larus\n fuscus", id: uuid(), type: "animal" },
  { name: "Somateria\n mollissima", id: uuid(), type: "animal" },
  { name: "Platichthys\n flesus", id: uuid(), type: "animal" },
  { name: "Haematopus\n ostralegus", id: uuid(), type: "animal" },
  { name: "Halichoerus\n grypus", id: uuid(), type: "animal" },
  { name: "Gasterosteus\n aculeatus", id: uuid(), type: "animal" },
  { name: "Squalus\n acanthias", id: uuid(), type: "animal" },
  { name: "Phocoena\n phocoena", id: uuid(), type: "animal" },
  { name: "Gadus\n morhua", id: uuid(), type: "animal" },
  { name: "Protists", id: uuid(), type: "animal" },
  { name: "Clupea\n harengus", id: uuid(), type: "animal" },
  { name: "Alca\n torda", id: uuid(), type: "animal" },
  { name: "Mergus\n merganser", id: uuid(), type: "animal" },
  { name: "Mytilus\n edulis", id: uuid(), type: "animal" },
  { name: "Salmo\n salar", id: uuid(), type: "animal" },
  { name: "Idotea\n baltica", id: uuid(), type: "animal" },
  { name: "Acipenser\n oxyrinchus", id: uuid(), type: "animal" },
  { name: "Myoxocephalus\n quadricornis", id: uuid(), type: "animal" },
  { name: "Perca\n fluviatilis", id: uuid(), type: "animal" },
  { name: "Esox\n lucius", id: uuid(), type: "animal" },
  { name: "Saduria\n entomon", id: uuid(), type: "animal" },
  { name: "Cygnus\n olor", id: uuid(), type: "animal" },
  { name: "Macoma\n balthic", id: uuid(), type: "animal" },
];
const plants: Card[] = [
  { name: "Myriophyllum\n spicatum", id: uuid(), type: "plant" },
  { name: "Potamogeton\n perfoliatus", id: uuid(), type: "plant" },
  { name: "Chrysochomulina", id: uuid(), type: "plant" },
  { name: "Ascophyllym\n nodosum", id: uuid(), type: "plant" },
  { name: "Synechococcus", id: uuid(), type: "plant" },
  { name: "Ruppia\n spp.", id: uuid(), type: "plant" },
  { name: "Najas\n marina", id: uuid(), type: "plant" },
  { name: "Fragmites\n australis", id: uuid(), type: "plant" },
  { name: "Fucus\n vesiculosus", id: uuid(), type: "plant" },
  { name: "Cladophora\n glomerata", id: uuid(), type: "plant" },
  { name: "Planothidium\n spp.", id: uuid(), type: "plant" },
  { name: "Pilayella\n littoralis", id: uuid(), type: "plant" },
  { name: "Zostera\n marina", id: uuid(), type: "plant" },
  { name: "Biecheleria\n baltica", id: uuid(), type: "plant" },
  { name: "Pauliella\n taeniata", id: uuid(), type: "plant" },
  { name: "Ulva\n lactuta", id: uuid(), type: "plant" },
  { name: "Chara\n ssp.", id: uuid(), type: "plant" },
  { name: "Mesodinium\n rubrum", id: uuid(), type: "plant" },
  { name: "Nodularia\n spumigena", id: uuid(), type: "plant" },
  { name: "Aphanizomenon\n flosaquae", id: uuid(), type: "plant" },
  { name: "Furcellaria\n lumbricalis", id: uuid(), type: "plant" },
  { name: "Oocystis\n borgei", id: uuid(), type: "plant" },
  { name: "Zanichellia\n palustris", id: uuid(), type: "plant" },
  { name: "Skeletonema\n marinoi", id: uuid(), type: "plant" },
  { name: "Vertebrata\n lanosa", id: uuid(), type: "plant" },
  { name: "Bacteria", id: uuid(), type: "plant" },
  { name: "Nitzschia\n filifomis", id: uuid(), type: "plant" },
  { name: "Ceramium\n tenuicorne", id: uuid(), type: "plant" },
  { name: "Fontinalis\n antipyretica", id: uuid(), type: "plant" },
  { name: "Viruses", id: uuid(), type: "plant" },
];
const elements: Card[] = [
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Sun", id: uuid(), type: "element" as CardType };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Oxygen", id: uuid(), type: "element" as CardType };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Salinity", id: uuid(), type: "element" as CardType };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Nutrients", id: uuid(), type: "element" as CardType };
  }),
  ...Array.from(Array(8).keys()).map((_) => {
    return { name: "Temperature", id: uuid(), type: "element" as CardType };
  }),
];
const disasters: Card[] = [
  ...Array.from(Array(30).keys()).map((_) => {
    return { name: "Storm", id: uuid(), type: "disaster" as CardType };
  }),
];

export type GameState = {
  players: Market[];
  animalMarket: Market;
  plantMarket: Market;
  elementMarket: Market;
  disasterMarket: Market;
};

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

  const playerDeck = shuffle(
    [...disasters.slice(0, 2), ...elements.slice(0, 4)],
    new Date().getMilliseconds().toString(),
  );
  const [gameState, setGameState] = useState<GameState>({
    players: [
      {
        deck: playerDeck.slice(4, playerDeck.length),
        table: playerDeck.slice(0, 4),
      },
    ],
    plantMarket: {
      deck: plants.slice(4, plants.length),
      table: plants.slice(0, 4),
    },
    animalMarket: {
      deck: animals.slice(4, animals.length),
      table: animals.slice(0, 4),
    },
    elementMarket: {
      deck: elements.slice(4, elements.length),
      table: [],
    },
    disasterMarket: {
      deck: disasters.slice(2, disasters.length),
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
  }, [aspect]);

  const updateMarket = (
    market: Market,
    id: string,
    direction: "out" | "in",
  ) => {
    const from = direction === "out" ? market.deck : market.table;
    const to = direction === "out" ? market.table : market.deck;

    const card = from.find((card: Card) => card.id === id);
    if (!card) return market;

    return {
      deck:
        direction === "out"
          ? from.filter((card: Card) => card.id !== id)
          : [...to, card],
      table:
        direction === "in"
          ? from.filter((card: Card) => card.id !== id)
          : [...to, card],
    };
  };

  const drawCard = (
    id: string,
    type: "animal" | "plant" | "element" | "disaster" | "player",
    direction: "out" | "in" | "transfer" = "out",
  ) => {
    if (direction === "transfer" && type !== "player") {
      transferCard(id, type);
      return;
    } else if (direction === "transfer") {
      return;
    }

    setGameState((prevGameState) => {
      switch (type) {
        case "animal":
          return {
            ...prevGameState,
            animalMarket: updateMarket(
              prevGameState.animalMarket,
              id,
              direction,
            ),
          };
        case "plant":
          return {
            ...prevGameState,
            plantMarket: updateMarket(prevGameState.plantMarket, id, direction),
          };
        case "element":
          return {
            ...prevGameState,
            elementMarket: updateMarket(
              prevGameState.elementMarket,
              id,
              direction,
            ),
          };
        case "disaster":
          return {
            ...prevGameState,
            disasterMarket: updateMarket(
              prevGameState.disasterMarket,
              id,
              direction,
            ),
          };
        case "player":
          return {
            ...prevGameState,
            players: [updateMarket(prevGameState.players[0], id, direction)],
          };
        default:
          return prevGameState;
      }
    });
  };

  const transferCard = (id: string, type: CardType) => {
    const moveCardFromTableToDeck = (prevGameState: GameState) => {
      return {
        ...prevGameState,
        players: prevGameState.players.map((player: Market) => ({
          ...player,
          deck: [
            ...player.deck,
            ...player.table.filter((card: Card) => card.id === id),
          ],
          table: player.table.filter((card: Card) => card.id !== id),
        })),
      };
    };

    const moveCardFromMarketToDeck = (
      prevGameState: GameState,
      market: Market,
    ) => {
      return {
        ...prevGameState,
        players: prevGameState.players.map((player: Market) => ({
          ...player,
          deck: [
            ...player.deck,
            ...market.table.filter((card: Card) => card.id === id),
          ],
        })),
        [type + "Market"]: {
          ...market,
          table: market.table.filter((card: Card) => card.id !== id),
        },
      };
    };

    setGameState((prevGameState) => {
      if (prevGameState.players[0].table.some((card: Card) => card.id === id)) {
        return moveCardFromTableToDeck(prevGameState);
      }

      switch (type) {
        case "animal":
          return moveCardFromMarketToDeck(
            prevGameState,
            prevGameState.animalMarket,
          );
        case "plant":
          return moveCardFromMarketToDeck(
            prevGameState,
            prevGameState.plantMarket,
          );
        case "disaster":
          return moveCardFromMarketToDeck(
            prevGameState,
            prevGameState.disasterMarket,
          );
        case "element":
          return moveCardFromMarketToDeck(
            prevGameState,
            prevGameState.elementMarket,
          );
        default:
          return prevGameState;
      }
    });
  };

  const shuffleDeck = (type: "player") => {
    switch (type) {
      case "player":
        setGameState((prevGameState) => {
          return {
            ...prevGameState,
            players: prevGameState.players.map((player) => {
              return {
                ...player,
                deck: shuffle(
                  player.deck,
                  new Date().getMilliseconds().toString(),
                ),
              };
            }),
          };
        });
        return;
      default:
        return;
    }
  };

  useEffect(() => console.log(gameState), [gameState]);

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
        <Croupier
          gameState={gameState}
          onDraw={(id, type, direction) => drawCard(id, type, direction)}
          onShuffle={(type) => shuffleDeck(type)}
        />

        <ExtinctionTiles />
        <BiomeTiles />
      </Canvas>
    </div>
  );
}

export default GameBoard;
