import { cardXOffset } from "@/constants/gameBoard";
import { default as CardComponent } from "./Card";
import { calculateDistance } from "@/utils/3d";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import { Card, GameState } from "@/state/types";
import { cardWidth } from "@/constants/card";
import {
  animalDeckPosition,
  disasterDeckPosition,
  drawAnimalCards,
  drawDisasterCards,
  drawElementCards,
  drawElementDecks,
  drawPlantCards,
  plantDeckPosition,
  supplyDeckPositions,
} from "@/lib/positioner";
import React from "react";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";

type PositionedCard = Card & { x: number; y: number };

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
  onCardMove,
  onShuffle,
}: {
  gameState: GameState;
  onCardMove: (card: Card, origin: CardMoveLocation, destination: CardMoveLocation) => void;
  onShuffle: (playerUid: string) => void;
}) => {
  const handleCardDrag = (
    card: Card,
    position: [number, number, number],
    comparisonPosition: [number, number, number],
    origin: CardMoveLocation,
    destination: CardMoveLocation,
  ) => {
    if (calculateDistance(position, comparisonPosition) < cardWidth) {
      onCardMove(card, origin, destination);
    }
  };
  const { gl } = useThree();
  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;

  return (
    <>
      {/* Market Cards */}
      {drawAnimalCards(gameState).map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position: [number, number, number]) => {
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
      ))}
      {drawPlantCards(gameState).map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
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
      {drawDisasterCards(gameState).map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
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
      {drawElementDecks(gameState).map((card: PositionedCard, index: number) => (
        <group key={index}>
          <Deck
            key={index}
            texturePath={`/ecosfera_baltica/element_${card.name}.avif`}
            textColor="black"
            position={[card.x, card.y, 0]}
            cards={gameState.elementMarket.deck.filter((elementCard) => elementCard.name === card.name)}
            onDraw={(card) => onCardMove(card, "elementDeck", "elementTable")}
          />
          {drawElementCards(gameState)
            .filter((elementCard) => card.name === elementCard.name)
            .map((elementCard: PositionedCard) => (
              <CardComponent
                card={elementCard}
                key={elementCard.uid}
                onDragEnd={(position) => {
                  handleCardDrag(elementCard, position, [card.x, card.y, 0], "elementTable", "elementDeck");
                  supplyDeckPositions(gameState).forEach((supplyDeckPosition, index) => {
                    handleCardDrag(
                      elementCard,
                      position,
                      supplyDeckPosition,
                      "elementTable",
                      `playerDeck_${gameState.players[index].uid}`,
                    );
                  });
                }}
              />
            ))}
        </group>
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
          <group position={supplyDeckPositions(gameState)[index]} rotation={[0, 0, index * (Math.PI / 2)]}>
            <AbilityTiles xStart={0 - cardWidth} />

            <Deck
              position={[0, 0, 0]}
              texturePath={`/ecosfera_baltica/back.avif`}
              cards={player.deck}
              onDraw={(card) => onCardMove(card, `playerDeck_${player.uid}`, `playerHand_${player.uid}`)}
              onShuffle={() => onShuffle(player.uid)}
              options={{ shuffleable: true }}
            />
          </group>
          {player.hand.map((card: Card, cardIndex: number) => (
            <CardComponent
              key={card.uid}
              card={{
                ...card,
                x:
                  supplyDeckPositions(gameState)[index][0] +
                  (index === 0 ? (cardIndex + 1) * cardXOffset : index === 2 ? (cardIndex + 1) * cardXOffset * -1 : 0),
                y:
                  supplyDeckPositions(gameState)[index][1] +
                  (index === 1 ? (cardIndex + 1) * cardXOffset : index === 3 ? (cardIndex + 1) * cardXOffset * -1 : 0),
              }}
              rotation={[0, 0, index * (Math.PI / 2)]}
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
