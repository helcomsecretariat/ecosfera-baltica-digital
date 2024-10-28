import { default as CardComponent } from "./Card";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import { AnimalCard, Card, DisasterCard, ElementCard, PlantCard } from "@/state/types";
import { cardWidth } from "@/constants/card";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";
import { useGameState } from "@/context/GameStateProvider";
import { uniqBy } from "lodash-es";
import { abilityOffset } from "@/constants/gameBoard";
import GamePieceGroup from "./GamePieceGroup";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { NextButton } from "@/components/NextTurnBtn";
import { TurnMachineGuards } from "@/state/machines/guards";
import CardAbilityTiles from "@/components/CardAbilityTiles";
import Stage from "@/components/Stage";
import Tile from "./Tile";
import TextWithShadow from "@/components/shapes/TextWithShadow";

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

const Croupier = () => {
  const { state: gameState, uiState } = useGameState();
  const { emit, test, hasTag } = useGameState();
  const { gl } = useThree();
  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;

  return (
    <AnimatePresence>
      {/* Market Cards */}
      {gameState.animalMarket.table.map((card: AnimalCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          onClick={emit.marketCardClick(card)}
          isHighlighted={test.marketCardClick(card)}
        />
      ))}
      {gameState.plantMarket.table.map((card: PlantCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          onClick={emit.marketCardClick(card)}
          isHighlighted={test.marketCardClick(card)}
        />
      ))}
      {gameState.disasterMarket.table.map((card: DisasterCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          // onClick={emit.buyCard(card)}
        />
      ))}
      {uniqBy(gameState.elementMarket.deck, "name").map((card: ElementCard) => (
        <Deck
          key={card.name}
          texturePath={`/ecosfera_baltica/element_${card.name}.avif`}
          textColor="black"
          gamePieceAppearance={uiState.deckPositions[`${card.name}ElementDeck`]}
          cards={gameState.elementMarket.deck.filter((elementDeckCard) => elementDeckCard.name === card.name)}
          isDimmed={!test.marketElementClick(card.name)}
          onClick={emit.marketElementClick(card.name)}
          isHighlighted={hasTag("usingAbility") && test.marketElementClick(card.name)}
        />
      ))}
      {gameState.turn.borrowedElement && (
        <CardComponent
          key={gameState.turn.borrowedElement.uid}
          card={gameState.turn.borrowedElement}
          gamePieceAppearance={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
          onClick={emit.borrowedElementClick(gameState.turn.borrowedElement)}
        />
      )}
      <Deck
        key={"animalDeck"}
        gamePieceAppearance={uiState.deckPositions["animalDeck"]}
        cards={gameState.animalMarket.deck}
        onClick={emit.animalDeckClick()}
        isHighlighted={test.animalDeckClick()}
      />
      <Deck
        key={"plantDeck"}
        gamePieceAppearance={uiState.deckPositions["plantDeck"]}
        cards={gameState.plantMarket.deck}
        onClick={emit.plantDeckClick()}
        isHighlighted={test.plantDeckClick()}
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
            <TextWithShadow
              position={[-6, 10, 0]}
              fontSize={5}
              color="white"
              shadowColor="white"
              anchorX="left"
              anchorY="bottom"
              textAlign="left"
            >
              {/* removing wierd space due to emoji */}
              {player.name.replace(" ", "")}
            </TextWithShadow>

            <Deck
              gamePieceAppearance={{
                ...uiState.deckPositions[`${player.uid}PlayerDeck`],
                position: { x: 0, y: 0, z: 0 },
                initialPosition: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
              }}
              cards={player.deck}
              onClick={emit.playerDeckClick()}
            />

            {player.uid === gameState.turn.player && (
              <>
                {gameState.turn.selectedAbilityCard === undefined ? (
                  <AbilityTiles
                    canRefresh={TurnMachineGuards.canRefreshAbility({ context: gameState })}
                    isClickable={true}
                    xStart={0 - cardWidth}
                    yStart={0 - abilityOffset}
                    abilities={player.abilities}
                  />
                ) : (
                  <CardAbilityTiles xStart={0 - cardWidth} yStart={0 - abilityOffset} />
                )}
              </>
            )}

            {player.uid !== gameState.turn.player && (
              <AbilityTiles
                canRefresh={false}
                isClickable={false}
                xStart={0 - cardWidth}
                yStart={0 - abilityOffset}
                abilities={player.abilities}
              />
            )}
          </GamePieceGroup>
        </React.Fragment>
      ))}

      {/* Stage */}
      <Stage key="stage" />

      {/* Extinction tiles */}
      {[...gameState.extinctMarket.deck, ...gameState.extinctMarket.table].map((extinctionTile) => (
        <Tile
          key={extinctionTile.uid}
          tileUid={extinctionTile.uid}
          color={gameState.extinctMarket.deck.includes(extinctionTile) ? "#c3b091" : "#d17b79"}
        />
      ))}

      {/* Habitat tiles */}
      {gameState.habitatMarket.deck.map((habitatTile) => (
        <Tile
          key={habitatTile.uid}
          tileUid={habitatTile.uid}
          name={habitatTile.name}
          color={habitatTile.isAcquired ? "#2cba16" : "#66cc66"}
        />
      ))}

      {/* Player Discard */}
      {gameState.players.map((player) => (
        <Deck
          gamePieceAppearance={{
            ...uiState.deckPositions[`${player.uid}PlayerDiscard`],
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
                onClick={emit.playerCardClick(card)}
                options={{ showAbilityButton: gameState.turn.player === player.uid }}
                isHighlighted={hasTag("usingAbility") && test.playerCardClick(card)}
              />
            ),
        ),
      )}

      <NextButton />
    </AnimatePresence>
  );
};

export default Croupier;
