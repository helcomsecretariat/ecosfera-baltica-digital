import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Grid from "./Grid";
import { useControls } from "leva";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { cameraZoom } from "../constants/gameBoard";
import ExtinctionTiles from "./ExtinctionTiles";
import BiomeTiles from "./BiomeTiles";
import { spawnDeck } from "@/state/game-state";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import Croupier from "./Croupier";
import { shuffle } from "@/state/utils";
import { Card } from "@/state/types";
import PreloadAssets from "@/components/PreloadAssets";
import type { DeckConfig } from "@/decks/schema";
import {
  AnimalCard,
  DisasterCard,
  ElementCard,
  PlantCard,
} from "@/state/types";

function GameBoard() {
  const searchParams = new URLSearchParams(window.location.search);
  const seed = searchParams.get("seed");
  //@ts-expect-error TS can infer enums from JSON files. Deck validation is done in the schema
  const deck = useMemo(() => spawnDeck(deckConfig, 1, seed), [seed]);
  const [gameState, setGameState] = useState(deck);

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

  type LocationToCardType = {
    animalDeck: AnimalCard[];
    animalTable: AnimalCard[];
    plantDeck: PlantCard[];
    plantTable: PlantCard[];
    disasterDeck: DisasterCard[];
    disasterTable: DisasterCard[];
    elementDeck: ElementCard[];
    elementTable: ElementCard[];
    playerDeck: Card[];
    playerHand: Card[];
  };

  const moveCard = <
    Origin extends keyof LocationToCardType,
    Destination extends keyof LocationToCardType,
  >(
    card: LocationToCardType[Origin][number],
    origin: Origin,
    destination: Destination,
  ) => {
    const locations: LocationToCardType = {
      animalDeck: gameState.animalMarket.deck,
      animalTable: gameState.animalMarket.table,
      plantDeck: gameState.plantMarket.deck,
      plantTable: gameState.plantMarket.table,
      disasterDeck: gameState.disasterMarket.deck,
      disasterTable: gameState.disasterMarket.table,
      elementDeck: gameState.elementMarket.deck,
      elementTable: gameState.elementMarket.table,
      playerDeck: gameState.players[0].deck,
      playerHand: gameState.players[0].hand,
    };

    locations[origin] = locations[origin].filter(
      (existingCard) => existingCard.uid !== card.uid,
    ) as LocationToCardType[Origin];

    locations[destination] = [
      ...locations[destination],
      card,
    ] as LocationToCardType[Destination];

    setGameState({
      ...gameState,
      players: [
        {
          ...gameState.players[0],
          deck: locations.playerDeck,
          hand: locations.playerHand,
        },
      ],
      animalMarket: {
        ...gameState.animalMarket,
        deck: locations.animalDeck,
        table: locations.animalTable,
      },
      plantMarket: {
        ...gameState.plantMarket,
        deck: locations.plantDeck,
        table: locations.plantTable,
      },
      disasterMarket: {
        ...gameState.disasterMarket,
        deck: locations.disasterDeck,
        table: locations.disasterTable,
      },
      elementMarket: {
        ...gameState.elementMarket,
        deck: locations.elementDeck,
        table: locations.elementTable,
      },
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
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#032C4E]">
      <PreloadAssets config={deckConfig as DeckConfig} />
      <Canvas
        className="relative"
        style={{ width: size.width, height: size.height }}
      >
        <color attach="background" args={["#032C4E"]} />
        {showGrid && <Grid divisions={gridDivisions} />}
        <PerspectiveCamera makeDefault position={[0, 0, cameraZoom]} />
        {orbitControls && <OrbitControls />}
        <Croupier
          gameState={gameState}
          onCardMove={(card, origin, destination) =>
            moveCard(card, origin, destination)
          }
          onShuffle={(type) => shuffleDeck(type)}
        />

        <ExtinctionTiles />
        <BiomeTiles />
      </Canvas>
    </div>
  );
}

export default GameBoard;
