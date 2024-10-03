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
import { shuffle } from "@/state/utils";
import { Card, UiState } from "@/state/types";
import PreloadAssets from "@/components/PreloadAssets";
import { AnimalCard, DisasterCard, ElementCard, PlantCard } from "@/state/types";
import { isEqual } from "lodash-es";
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
  const { state, send } = useGameState();
  const [gameState, setGameState] = useState(state);
  const prevUiStateRef = useRef<UiState | null>(null);
  const uiState = useMemo(() => toUiState(prevUiStateRef.current, state), [state]);

  useEffect(() => {
    if (!isEqual(gameState, state)) {
      send({ type: "IDDQD", data: gameState });
    }
  }, [gameState]);

  useEffect(() => {
    setGameState(state);
  }, [state]);

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

  type LocationToCardType = {
    animalDeck: AnimalCard[];
    animalTable: AnimalCard[];
    plantDeck: PlantCard[];
    plantTable: PlantCard[];
    disasterDeck: DisasterCard[];
    disasterTable: DisasterCard[];
    elementDeck: ElementCard[];
    elementTable: ElementCard[];
    [key: `playerDeck_${string}`]: Card[];
    [key: `playerHand_${string}`]: Card[];
  };

  const moveCard = <Origin extends keyof LocationToCardType, Destination extends keyof LocationToCardType>(
    card: LocationToCardType[Origin][number],
    origin: Origin,
    destination: Destination,
  ) => {
    const getPlayerUidFromLocation = (location: string) => {
      const parts = location.split("_");
      return parts.length > 1 ? parts[1] : null;
    };
    const originPlayerUid = getPlayerUidFromLocation(origin);
    const destinationPlayerUid = getPlayerUidFromLocation(destination);

    const locations: LocationToCardType = {
      animalDeck: gameState.animalMarket.deck,
      animalTable: gameState.animalMarket.table,
      plantDeck: gameState.plantMarket.deck,
      plantTable: gameState.plantMarket.table,
      disasterDeck: gameState.disasterMarket.deck,
      disasterTable: gameState.disasterMarket.table,
      elementDeck: gameState.elementMarket.deck,
      elementTable: gameState.elementMarket.table,
      [`playerDeck_${originPlayerUid}`]: gameState.players.find((player) => player.uid === originPlayerUid)?.deck ?? [],
      [`playerHand_${originPlayerUid}`]: gameState.players.find((player) => player.uid === originPlayerUid)?.hand ?? [],
      [`playerDeck_${destinationPlayerUid}`]:
        gameState.players.find((player) => player.uid === destinationPlayerUid)?.deck ?? [],
      [`playerHand_${destinationPlayerUid}`]:
        gameState.players.find((player) => player.uid === destinationPlayerUid)?.hand ?? [],
    };

    locations[origin] = locations[origin].filter(
      (existingCard) => existingCard.uid !== card.uid,
    ) as LocationToCardType[Origin];

    locations[destination] = [...locations[destination], card] as LocationToCardType[Destination];

    setGameState({
      ...gameState,
      players: gameState.players.map((player) => {
        if (player.uid === originPlayerUid) {
          return {
            ...player,
            deck: locations[`playerDeck_${originPlayerUid}`],
            hand: locations[`playerHand_${originPlayerUid}`],
          };
        }
        if (player.uid === destinationPlayerUid) {
          return {
            ...player,
            deck: locations[`playerDeck_${destinationPlayerUid}`],
            hand: locations[`playerHand_${destinationPlayerUid}`],
          };
        }
        return player;
      }),
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
                deck: shuffle(player.deck, new Date().getMilliseconds().toString()),
              }
            : player,
        ),
      };
    });
  };

  useEffect(() => {
    console.log(gameState);
  }, [gameState]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <PreloadAssets config={deckConfig as DeckConfig} />
      <Canvas shadows className="relative" style={{ width: size.width, height: size.height }}>
        <ambientLight intensity={1.5} />
        {/* <color attach="background" args={["#032C4E"]} /> */}
        {showGrid && <Grid divisions={gridDivisions} />}
        <PerspectiveCamera makeDefault position={[0, 0, cameraZoom]} />
        {orbitControls && <OrbitControls />}
        <Croupier
          gameState={gameState}
          uiState={uiState}
          onCardMove={(card, origin, destination) => moveCard(card, origin, destination)}
          onShuffle={(playerUid) => shuffleDeck(playerUid)}
        />

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
      value: 1,
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
