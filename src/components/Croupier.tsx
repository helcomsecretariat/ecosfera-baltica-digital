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
import { motion } from "framer-motion-3d";

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
  const { handlers } = useGameState();
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
            onClick={handlers.marketCardClick(card)}
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
          onClick={handlers.marketCardClick(card)}
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
          // onClick={handlers.buyCard(card)}
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
          // onDraw={(card) => onCardMove(card, "elementDeck", "elementTable")}
          onClick={handlers.marketElementClick(card.name)}
        />
      ))}
      {gameState.turn.borrowedElement && (
        <CardComponent
          key={gameState.turn.borrowedElement.uid}
          card={gameState.turn.borrowedElement}
          gamePieceTransform={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
          onClick={() => console.error("borrowed element click NOT IMPLEMENTED")}
        />
      )}
      <Deck
        position={uiState.deckPositions["animalDeck"].position}
        texturePath={`/ecosfera_baltica/bg_animals.avif`}
        cards={gameState.animalMarket.deck}
        onClick={handlers.animalDeckClick()}
      />
      <Deck
        position={uiState.deckPositions["plantDeck"].position}
        texturePath={`/ecosfera_baltica/bg_plants.avif`}
        cards={gameState.plantMarket.deck}
        onClick={handlers.plantDeckClick()}
      />
      <Deck
        position={uiState.deckPositions["disasterDeck"].position}
        texturePath={`/ecosfera_baltica/disaster_flood.avif`}
        cards={gameState.disasterMarket.deck}
        onClick={() => console.error("Disaster deck click NOT IMPLEMENTED")}
      />

      {/* Player Cards */}
      {gameState.players.map((player, index) => (
        <React.Fragment key={index}>
          <motion.group
            animate={{
              x: toVector3(supplyDeckPositions(gameState)[index])[0],
              y: toVector3(supplyDeckPositions(gameState)[index])[1],
              z: toVector3(supplyDeckPositions(gameState)[index])[2],
              rotateX: 0,
              rotateY: 0,
              rotateZ: index * (Math.PI / 2),
            }}
          >
            <AbilityTiles xStart={0 - cardWidth} abilities={player.abilities} />

            <Deck
              position={{ x: 0, y: 0, z: 0 }}
              texturePath={`/ecosfera_baltica/back.avif`}
              cards={player.deck}
              onClick={handlers.playerDeckClick()}
              onShuffle={() => onShuffle(player.uid)}
              options={{ shuffleable: true }}
            />
          </motion.group>
          {player.hand.map((card: Card) => (
            <CardComponent
              key={card.uid}
              card={card}
              gamePieceTransform={uiState.cardPositions[card.uid]}
              //@ts-expect-error TODO: fix type check...
              onClick={handlers.playerCardClick(card)}
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
