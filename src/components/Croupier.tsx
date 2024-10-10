import { default as CardComponent } from "./Card";
import { calculateDistance } from "@/utils/3d";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import { AnimalCard, Card, Coordinate, DisasterCard, ElementCard, GameState, PlantCard, UiState } from "@/state/types";
import { cardWidth } from "@/constants/card";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";
import { useGameState } from "@/context/GameStateProvider";
import { animalDeckPosition, disasterDeckPosition, plantDeckPosition, supplyDeckPositions } from "@/state/positioner";
import { uniqBy } from "lodash-es";
import { abilityOffset } from "@/constants/gameBoard";
import GamePieceGroup from "./GamePieceGroup";
import { Html } from "@react-three/drei";
import { Button } from "./ui/button";
import { AnimatePresence } from "framer-motion";

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
            gamePieceAppearance={uiState.cardPositions[card.uid]}
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
          gamePieceAppearance={uiState.cardPositions[card.uid]}
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
          gamePieceAppearance={uiState.cardPositions[card.uid]}
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
          gamePieceAppearance={uiState.deckPositions[`${card.name}ElementDeck`]}
          cards={gameState.elementMarket.deck.filter((elementDeckCard) => elementDeckCard.name === card.name)}
          // onDraw={(card) => onCardMove(card, "elementDeck", "elementTable")}
          onClick={handlers.marketElementClick(card.name)}
        />
      ))}
      <AnimatePresence>
        {gameState.turn.borrowedElement && (
          <CardComponent
            key={`borrowed +${gameState.turn.borrowedElement.uid}`}
            card={gameState.turn.borrowedElement}
            gamePieceAppearance={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
            onClick={handlers.borrowedElementClick(gameState.turn.borrowedElement)}
          />
        )}
      </AnimatePresence>
      <Deck
        gamePieceAppearance={uiState.deckPositions["animalDeck"]}
        texturePath={`/ecosfera_baltica/bg_animals.avif`}
        cards={gameState.animalMarket.deck}
        onClick={handlers.animalDeckClick()}
      />
      <Deck
        gamePieceAppearance={uiState.deckPositions["plantDeck"]}
        texturePath={`/ecosfera_baltica/bg_plants.avif`}
        cards={gameState.plantMarket.deck}
        onClick={handlers.plantDeckClick()}
      />
      <Deck
        gamePieceAppearance={uiState.deckPositions["disasterDeck"]}
        texturePath={`/ecosfera_baltica/disaster_flood.avif`}
        cards={gameState.disasterMarket.deck}
        onClick={() => console.error("Disaster deck click NOT IMPLEMENTED")}
      />

      {/* Player Cards */}
      {gameState.players.map((player, index) => (
        <group key={index}>
          {gameState.turn.player === player.uid && (
            <GamePieceGroup gamePieceAppearance={uiState.deckPositions[`${player.uid}PlayerDeck`]}>
              <AbilityTiles xStart={0 - cardWidth} yStart={0 - abilityOffset} abilities={player.abilities} />

              <Deck
                gamePieceAppearance={{
                  transform: {
                    position: { x: 0, y: 0, z: 0 },
                    initialPosition: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                  },
                  display: uiState.deckPositions[`${player.uid}PlayerDeck`].display,
                }}
                texturePath={`/ecosfera_baltica/back.avif`}
                cards={player.deck}
                onClick={handlers.playerDeckClick()}
                onShuffle={() => onShuffle(player.uid)}
                options={{ shuffleable: true }}
              />
              <Html transform center position={[0, 15, 0]} scale={4}>
                <Button onClick={handlers.playerEndTurnClick()}>End turn</Button>
              </Html>
            </GamePieceGroup>
          )}
          <AnimatePresence>
            {gameState.turn.borrowedElement && (
              <CardComponent
                key={`borrowed +${gameState.turn.borrowedElement.uid}`}
                card={gameState.turn.borrowedElement}
                gamePieceAppearance={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
                onClick={handlers.borrowedElementClick(gameState.turn.borrowedElement)}
              />
            )}
            {player.hand.map(
              (card: Card) =>
                uiState.cardPositions[card.uid] && (
                  <CardComponent
                    key={card.uid}
                    card={card}
                    gamePieceAppearance={uiState.cardPositions[card.uid]}
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
                ),
            )}
          </AnimatePresence>
        </group>
      ))}
    </>
  );
};

export default Croupier;
