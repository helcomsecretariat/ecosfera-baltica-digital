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
  const { showGrid, gridDivisions, orbitControls, numberOfPlayers } =
    useControls({
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
  const deck = useMemo(
    //@ts-expect-error TS can infer enums from JSON files. Deck validation is done in the schema
    () => spawnDeck(deckConfig, numberOfPlayers, seed),
    [seed, numberOfPlayers],
  );
  const [gameState, setGameState] = useState(deck);

  useEffect(() => {
    setGameState(deck);
  }, [deck]);

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
    playerUid?: string,
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
      playerDeck:
        gameState.players.find((player) => player.uid === playerUid)?.deck ??
        gameState.players[0].deck,
      playerHand:
        gameState.players.find((player) => player.uid === playerUid)?.hand ??
        gameState.players[1].hand,
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
      players: gameState.players.map((player) =>
        player.uid !== playerUid
          ? player
          : {
              ...player,
              deck: locations.playerDeck,
              hand: locations.playerHand,
            },
      ),
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

  const shuffleDeck = (playerUid: string) => {
    setGameState((prevGameState) => {
      return {
        ...prevGameState,
        players: prevGameState.players.map((player) =>
          player.uid === playerUid
            ? {
                ...player,
                deck: shuffle(
                  player.deck,
                  new Date().getMilliseconds().toString(),
                ),
              }
            : player,
        ),
      };
    });
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
          onCardMove={(card, origin, destination, playerUid) =>
            moveCard(card, origin, destination, playerUid)
          }
          onShuffle={(playerUid) => shuffleDeck(playerUid)}
        />

        <ExtinctionTiles />
        <BiomeTiles />
      </Canvas>
    </div>
  );
}

export default GameBoard;
