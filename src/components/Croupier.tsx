import { default as CardComponent } from "./Card";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import { AnimalCard, Card, DisasterCard, ElementCard, GameState, PlantCard, UiState } from "@/state/types";
import { cardWidth } from "@/constants/card";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";
import { useGameState } from "@/context/GameStateProvider";
import { uniqBy } from "lodash-es";
import { abilityOffset } from "@/constants/gameBoard";
import GamePieceGroup from "./GamePieceGroup";
import { Html } from "@react-three/drei";
import { Button } from "./ui/button";
import { AnimatePresence } from "framer-motion";
import React from "react";

export type CardMoveLocation =
  | "animalTable"
  | "animalDeck"
  | "plantTable"
  | "plantDeck"
  | "elementTable"
  | "elementDeck"
  | "disasterTable"
  | "disasterDeck"
  | `playerDeck_${string}`
  | `playerHand_${string}`;

const Croupier = ({ gameState, uiState }: { gameState: GameState; uiState: UiState }) => {
  const { handlers } = useGameState();
  const { gl } = useThree();
  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;

  return (
    <AnimatePresence>
      {/* Market Cards */}
      {gameState.animalMarket.table.map((card: AnimalCard) => {
        return (
          <CardComponent
            key={card.uid}
            card={card}
            gamePieceAppearance={uiState.cardPositions[card.uid]}
            onClick={handlers.marketCardClick(card)}
          />
        );
      })}
      {gameState.plantMarket.table.map((card: PlantCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          onClick={handlers.marketCardClick(card)}
        />
      ))}
      {gameState.disasterMarket.table.map((card: DisasterCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          // onClick={handlers.buyCard(card)}
        />
      ))}
      {uniqBy(gameState.elementMarket.deck, "name").map((card: ElementCard) => (
        <Deck
          key={card.name}
          texturePath={`/ecosfera_baltica/element_${card.name}.avif`}
          textColor="black"
          gamePieceAppearance={uiState.deckPositions[`${card.name}ElementDeck`]}
          cards={gameState.elementMarket.deck.filter((elementDeckCard) => elementDeckCard.name === card.name)}
          onClick={handlers.marketElementClick(card.name)}
        />
      ))}
      {gameState.turn.borrowedElement && (
        <CardComponent
          key={gameState.turn.borrowedElement.uid}
          card={gameState.turn.borrowedElement}
          gamePieceAppearance={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
          onClick={handlers.borrowedElementClick(gameState.turn.borrowedElement)}
        />
      )}
      {gameState.turn.borrowedElement && (
        <CardComponent
          key={gameState.turn.borrowedElement.uid}
          card={gameState.turn.borrowedElement}
          gamePieceAppearance={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
          onClick={handlers.borrowedElementClick(gameState.turn.borrowedElement)}
        />
      )}
      <Deck
        key={"animalDeck"}
        gamePieceAppearance={uiState.deckPositions["animalDeck"]}
        cards={gameState.animalMarket.deck}
        onClick={handlers.animalDeckClick()}
      />
      <Deck
        key={"plantDeck"}
        gamePieceAppearance={uiState.deckPositions["plantDeck"]}
        cards={gameState.plantMarket.deck}
        onClick={handlers.plantDeckClick()}
      />
      <Deck
        key={"disasterDeck"}
        gamePieceAppearance={uiState.deckPositions["disasterDeck"]}
        cards={gameState.disasterMarket.deck}
        onClick={() => console.error("Disaster deck click NOT IMPLEMENTED")}
      />

      {/* Player HUD */}
      {gameState.players.map((player) => (
        <React.Fragment key={player.uid + "HUD"}>
          <GamePieceGroup gamePieceAppearance={uiState.deckPositions[`${player.uid}PlayerDeck`]}>
            <Deck
              gamePieceAppearance={{
                ...uiState.deckPositions[`${player.uid}PlayerDeck`],
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  initialPosition: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                },
              }}
              cards={player.deck}
              onClick={handlers.playerDeckClick()}
            />

            {player.uid === gameState.turn.player && (
              <>
                <AbilityTiles xStart={0 - cardWidth} yStart={0 - abilityOffset} abilities={player.abilities} />
                <Html transform center position={[0, 15, 0]} scale={4}>
                  <Button onClick={handlers.playerEndTurnClick()}>End turn</Button>
                </Html>
              </>
            )}
          </GamePieceGroup>
        </React.Fragment>
      ))}

      {/* Player Discard */}
      {gameState.players.map((player) => (
        <Deck
          gamePieceAppearance={{
            ...uiState.deckPositions[`${player.uid}PlayerDiscard`],
            display: { visibility: "default" },
          }}
          cards={player.discard}
          key={player.uid + "PlayerDiscard"}
          onClick={() => console.error("discard click NOT IMPLEMENTED")}
        />
      ))}

      {/* Player Cards */}
      {gameState.players.flatMap((player) =>
        player.hand.map(
          (card: Card) =>
            uiState.cardPositions[card.uid] && (
              <CardComponent
                key={card.uid}
                card={card}
                gamePieceAppearance={uiState.cardPositions[card.uid]}
                //@ts-expect-error TODO: fix type check...
                onClick={handlers.playerCardClick(card)}
              />
            ),
        ),
      )}
    </AnimatePresence>
  );
};

export default Croupier;
