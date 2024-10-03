import { default as CardComponent } from "./Card";
import { calculateDistance, toVector3 } from "@/utils/3d";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import { AnimalCard, Card, Coordinate, DisasterCard, ElementCard, GameState, PlantCard, UiState } from "@/state/types";
import { cardWidth } from "@/constants/card";
import React from "react";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";
import { useGameState } from "@/context/GameStateProvider";
import { animalDeckPosition, disasterDeckPosition, plantDeckPosition, supplyDeckPositions } from "@/state/positioner";
import { uniqBy } from "lodash-es";

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

const Croupier = ({
  gameState,
  uiState,
  onCardMove,
  onShuffle,
}: {
  gameState: GameState;
  uiState: UiState;
  onCardMove: (card: Card, origin: CardMoveLocation, destination: CardMoveLocation) => void;
  onShuffle: (playerUid: string) => void;
}) => {
  const handleCardDrag = (
    card: Card,
    position: Coordinate,
    comparisonPosition: Coordinate,
    origin: CardMoveLocation,
    destination: CardMoveLocation,
  ) => {
    if (calculateDistance(position, comparisonPosition) < cardWidth) {
      onCardMove(card, origin, destination);
    }
  };
  const { send } = useGameState();
  const { gl } = useThree();
  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;

  return (
    <>
      {/* Market Cards */}
      {gameState.animalMarket.table.map((card: AnimalCard) => {
        return (
          <CardComponent
            key={card.uid}
            card={card}
            gamePieceTransform={uiState.cardPositions[card.uid]}
            onClick={() => {
              send({ type: "BUY_MARKET_CARD", data: { card, player: gameState.players[0] } });
            }}
            onDragEnd={(position: Coordinate) => {
              handleCardDrag(card, position, animalDeckPosition, "animalTable", "animalDeck");
              supplyDeckPositions(gameState).forEach((supplyDeckPosition, index) => {
                handleCardDrag(
                  card,
                  position,
                  supplyDeckPosition,
                  "animalTable",
                  `playerDeck_${gameState.players[index].uid}`,
                );
              });
            }}
          />
        );
      })}
      {gameState.plantMarket.table.map((card: PlantCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceTransform={uiState.cardPositions[card.uid]}
          onClick={() => {
            send({ type: "BUY_MARKET_CARD", data: { card, player: gameState.players[0] } });
          }}
          onDragEnd={(position) => {
            handleCardDrag(card, position, plantDeckPosition, "plantTable", "plantDeck");
            supplyDeckPositions(gameState).forEach((supplyDeckPosition, index) => {
              handleCardDrag(
                card,
                position,
                supplyDeckPosition,
                "plantTable",
                `playerDeck_${gameState.players[index].uid}`,
              );
            });
          }}
        />
      ))}
      {gameState.disasterMarket.table.map((card: DisasterCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceTransform={uiState.cardPositions[card.uid]}
          onClick={() => {
            send({ type: "BUY_MARKET_CARD", data: { card, player: gameState.players[0] } });
          }}
          onDragEnd={(position) => {
            handleCardDrag(card, position, disasterDeckPosition, "disasterTable", "disasterDeck");
            supplyDeckPositions(gameState).forEach((supplyDeckPosition, index) => {
              handleCardDrag(
                card,
                position,
                supplyDeckPosition,
                "disasterTable",
                `playerDeck_${gameState.players[index].uid}`,
              );
            });
          }}
        />
      ))}
      {uniqBy(gameState.elementMarket.deck, "name").map((card: ElementCard) => (
        <Deck
          key={card.name}
          texturePath={`/ecosfera_baltica/element_${card.name}.avif`}
          textColor="black"
          position={uiState.deckPositions[`${card.name}ElementDeck`].position}
          initialPosition={uiState.deckPositions[`${card.name}ElementDeck`].initialPosition}
          rotation={uiState.deckPositions[`${card.name}ElementDeck`].rotation}
          cards={gameState.elementMarket.deck.filter((elementDeckCard) => elementDeckCard.name === card.name)}
          onDraw={(card) => onCardMove(card, "elementDeck", "elementTable")}
        />
      ))}
      {gameState.elementMarket.table.map((card: ElementCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceTransform={uiState.cardPositions[card.uid]}
          onClick={() => {
            send({ type: "BUY_MARKET_CARD", data: { card, player: gameState.players[0] } });
          }}
          onDragEnd={(position) => {
            handleCardDrag(
              card,
              position,
              uiState.deckPositions[`${card.name}ElementDeck`].position,
              "elementTable",
              "elementDeck",
            );
            supplyDeckPositions(gameState).forEach((supplyDeckPosition, index) => {
              handleCardDrag(
                card,
                position,
                supplyDeckPosition,
                "elementTable",
                `playerDeck_${gameState.players[index].uid}`,
              );
            });
          }}
        />
      ))}
      <Deck
        position={animalDeckPosition}
        texturePath={`/ecosfera_baltica/bg_animals.avif`}
        cards={gameState.animalMarket.deck}
        onDraw={(card) => onCardMove(card, "animalDeck", "animalTable")}
      />
      <Deck
        position={plantDeckPosition}
        texturePath={`/ecosfera_baltica/bg_plants.avif`}
        cards={gameState.plantMarket.deck}
        onDraw={(card) => onCardMove(card, "plantDeck", "plantTable")}
      />
      <Deck
        position={disasterDeckPosition}
        texturePath={`/ecosfera_baltica/disaster_flood.avif`}
        cards={gameState.disasterMarket.deck}
        onDraw={(card) => onCardMove(card, "disasterDeck", "disasterTable")}
      />

      {/* Player Cards */}
      {gameState.players.map((player, index) => (
        <React.Fragment key={index}>
          <group position={toVector3(supplyDeckPositions(gameState)[index])} rotation={[0, 0, index * (Math.PI / 2)]}>
            <AbilityTiles xStart={0 - cardWidth} />

            <Deck
              position={{ x: 0, y: 0, z: 0 }}
              texturePath={`/ecosfera_baltica/back.avif`}
              cards={player.deck}
              onDraw={(card) => onCardMove(card, `playerDeck_${player.uid}`, `playerHand_${player.uid}`)}
              onShuffle={() => onShuffle(player.uid)}
              options={{ shuffleable: true }}
            />
          </group>
          {player.hand.map((card: Card) => (
            <CardComponent
              key={card.uid}
              card={card}
              gamePieceTransform={uiState.cardPositions[card.uid]}
              onDragEnd={(position) => {
                supplyDeckPositions(gameState).forEach((supplyDeckPosition, index) => {
                  handleCardDrag(
                    card,
                    position,
                    supplyDeckPosition,
                    `playerHand_${player.uid}`,
                    `playerDeck_${gameState.players[index].uid}`,
                  );
                });
                if (card.type === "animal") {
                  handleCardDrag(card, position, animalDeckPosition, `playerHand_${player.uid}`, "animalDeck");
                }
                if (card.type === "plant") {
                  handleCardDrag(card, position, plantDeckPosition, `playerHand_${player.uid}`, "plantDeck");
                }
              }}
            />
          ))}
        </React.Fragment>
      ))}
    </>
  );
};

export default Croupier;
