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
import { Card, GamePiece, GameState, Market, PlayerState } from "@/state/types";

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

  const shiftMarketCard = <T extends GamePiece>(
    market: Market<T>,
    uid: string,
    direction: "out" | "in",
  ) => {
    const from = direction === "out" ? market.deck : market.table;
    const to = direction === "out" ? market.table : market.deck;

    const card = from.find((card: T) => card.uid === uid);
    if (!card) return market;

    return {
      ...market,
      deck:
        direction === "out"
          ? from.filter((card: T) => card.uid !== uid)
          : [...to, card],
      table:
        direction === "in"
          ? from.filter((card: T) => card.uid !== uid)
          : [...to, card],
    };
  };

  const shiftPlayerCard = (
    player: PlayerState,
    uid: string,
    direction: "out" | "in",
  ) => {
    const from = direction === "out" ? player.deck : player.hand;
    const to = direction === "out" ? player.hand : player.deck;

    const card = from.find((card: Card) => card.uid === uid);
    if (!card) return player;

    return {
      ...player,
      deck:
        direction === "out"
          ? from.filter((card: Card) => card.uid !== uid)
          : [...to, card],
      hand:
        direction === "in"
          ? from.filter((card: Card) => card.uid !== uid)
          : [...to, card],
    };
  };

  const moveCard = (
    card: GamePiece,
    deckType: "market" | "player",
    direction: "in" | "out" | "transfer",
  ) => {
    if (direction === "transfer") {
      transferCard(card);
      return;
    }

    if (deckType === "market") {
      setGameState((prevGameState) => {
        switch (card.type) {
          case "animal":
            return {
              ...prevGameState,
              animalMarket: shiftMarketCard(
                prevGameState.animalMarket,
                card.uid,
                direction,
              ),
            };
          case "plant":
            return {
              ...prevGameState,
              plantMarket: shiftMarketCard(
                prevGameState.plantMarket,
                card.uid,
                direction,
              ),
            };
          case "element":
            return {
              ...prevGameState,
              elementMarket: shiftMarketCard(
                prevGameState.elementMarket,
                card.uid,
                direction,
              ),
            };
          case "disaster":
            return {
              ...prevGameState,
              disasterMarket: shiftMarketCard(
                prevGameState.disasterMarket,
                card.uid,
                direction,
              ),
            };
          default:
            return prevGameState;
        }
      });
    } else if (deckType === "player") {
      setGameState((prevGameState) => {
        return {
          ...prevGameState,
          players: prevGameState.players.map((player: PlayerState) =>
            shiftPlayerCard(player, card.uid, direction),
          ),
        };
      });
    }
  };

  const transferCard = (card: GamePiece) => {
    const moveCardFromMarketToDeck = <T extends GamePiece>(
      prevGameState: GameState,
      market: Market<T>,
    ) => {
      return {
        ...prevGameState,
        players: prevGameState.players.map((player: PlayerState) => ({
          ...player,
          deck: [
            ...player.deck,
            ...market.table.filter(
              (existingCard: T) => existingCard.uid === card.uid,
            ),
          ],
        })),
        [market.type + "Market"]: {
          ...market,
          table: market.table.filter(
            (existingCard: T) => existingCard.uid !== card.uid,
          ),
        },
      };
    };

    setGameState((prevGameState: GameState) => {
      if (
        prevGameState.players[0].hand.some(
          (existingCard: Card) => existingCard.uid === card.uid,
        )
      ) {
        return {
          ...prevGameState,
          players: prevGameState.players.map((player) =>
            shiftPlayerCard(player, card.uid, "in"),
          ),
        };
      }

      switch (card.type) {
        case "animal":
          return {
            ...moveCardFromMarketToDeck(
              prevGameState,
              prevGameState.animalMarket,
            ),
          };
        case "plant":
          return {
            ...moveCardFromMarketToDeck(
              prevGameState,
              prevGameState.plantMarket,
            ),
          };
        case "disaster":
          return {
            ...moveCardFromMarketToDeck(
              prevGameState,
              prevGameState.disasterMarket,
            ),
          };
        case "element":
          return {
            ...moveCardFromMarketToDeck(
              prevGameState,
              prevGameState.elementMarket,
            ),
          };
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
          onCardMove={(card, direction, deckType) =>
            moveCard(card, deckType, direction)
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
