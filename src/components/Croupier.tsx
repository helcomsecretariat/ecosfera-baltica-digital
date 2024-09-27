import { cardXOffset } from "@/constants/gameBoard";
import { default as CardComponent } from "./Card";
import { calculateDistance } from "@/utils/3d";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import { Card, GameState } from "@/state/types";
import { getCardBGColor } from "@/components/utils";
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
  | "playerDeck"
  | "playerHand";

const Croupier = ({
  gameState,
  onCardMove,
  onShuffle,
}: {
  gameState: GameState;
  onCardMove: (
    card: Card,
    origin: CardMoveLocation,
    destination: CardMoveLocation,
    playerUid?: string,
  ) => void;
  onShuffle: (playerUid: string) => void;
}) => {
  const handleCardDrag = (
    card: Card,
    position: [number, number, number],
    comparisonPosition: [number, number, number],
    origin: CardMoveLocation,
    destination: CardMoveLocation,
    playerUid?: string,
  ) => {
    if (calculateDistance(position, comparisonPosition) < cardWidth) {
      onCardMove(card, origin, destination, playerUid);
    }
  };

  return (
    <>
      {/* Market Cards */}
      {drawAnimalCards(gameState).map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position: [number, number, number]) => {
            handleCardDrag(
              card,
              position,
              animalDeckPosition,
              "animalTable",
              "animalDeck",
            );
            supplyDeckPositions(gameState).forEach(
              (supplyDeckPosition, index) => {
                handleCardDrag(
                  card,
                  position,
                  supplyDeckPosition,
                  "animalTable",
                  "playerDeck",
                  gameState.players[index].uid,
                );
              },
            );
          }}
        />
      ))}
      {drawPlantCards(gameState).map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position) => {
            handleCardDrag(
              card,
              position,
              plantDeckPosition,
              "plantTable",
              "plantDeck",
            );
            supplyDeckPositions(gameState).forEach(
              (supplyDeckPosition, index) => {
                handleCardDrag(
                  card,
                  position,
                  supplyDeckPosition,
                  "plantTable",
                  "playerDeck",
                  gameState.players[index].uid,
                );
              },
            );
          }}
        />
      ))}
      {drawDisasterCards(gameState).map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position) => {
            handleCardDrag(
              card,
              position,
              disasterDeckPosition,
              "disasterTable",
              "disasterDeck",
            );
            supplyDeckPositions(gameState).forEach(
              (supplyDeckPosition, index) => {
                handleCardDrag(
                  card,
                  position,
                  supplyDeckPosition,
                  "disasterTable",
                  "playerDeck",
                  gameState.players[index].uid,
                );
              },
            );
          }}
        />
      ))}
      {drawElementDecks(gameState).map(
        (card: PositionedCard, index: number) => (
          <group key={index}>
            <Deck
              key={index}
              name={`${card.name}\n${
                gameState.elementMarket.deck.filter(
                  (elementCard) => elementCard.name === card.name,
                ).length
              } left`}
              color={getCardBGColor(card).toString().replace("0x", "#")}
              textColor="black"
              position={[card.x, card.y, 0]}
              cards={gameState.elementMarket.deck.filter(
                (elementCard) => elementCard.name === card.name,
              )}
              onDraw={(card) => onCardMove(card, "elementDeck", "elementTable")}
            />
            {drawElementCards(gameState)
              .filter((elementCard) => card.name === elementCard.name)
              .map((elementCard: PositionedCard) => (
                <CardComponent
                  card={elementCard}
                  key={elementCard.uid}
                  onDragEnd={(position) => {
                    handleCardDrag(
                      elementCard,
                      position,
                      [card.x, card.y, 0],
                      "elementTable",
                      "elementDeck",
                    );
                    supplyDeckPositions(gameState).forEach(
                      (supplyDeckPosition, index) => {
                        handleCardDrag(
                          elementCard,
                          position,
                          supplyDeckPosition,
                          "elementTable",
                          "playerDeck",
                          gameState.players[index].uid,
                        );
                      },
                    );
                  }}
                />
              ))}
          </group>
        ),
      )}
      <Deck
        position={animalDeckPosition}
        color="#00848E"
        name={`Animals \n${gameState.animalMarket.deck.length} left`}
        cards={gameState.animalMarket.deck}
        onDraw={(card) => onCardMove(card, "animalDeck", "animalTable")}
      />
      <Deck
        position={plantDeckPosition}
        color="#00848E"
        name={`Plants \n${gameState.plantMarket.deck.length} left`}
        cards={gameState.plantMarket.deck}
        onDraw={(card) => onCardMove(card, "plantDeck", "plantTable")}
      />
      <Deck
        position={disasterDeckPosition}
        color="#00848E"
        name={`Disasters \n${gameState.disasterMarket.deck.length} left`}
        cards={gameState.disasterMarket.deck}
        onDraw={(card) => onCardMove(card, "disasterDeck", "disasterTable")}
      />

      {/* Player Cards */}
      {gameState.players.map((player, index) => (
        <>
          <group
            position={supplyDeckPositions(gameState)[index]}
            rotation={[0, 0, index * (Math.PI / 2)]}
          >
            <AbilityTiles xStart={0 - cardWidth} />

            <Deck
              position={[0, 0, 0]}
              color="#00848E"
              name={`Supply \n${player.deck.length} left`}
              cards={player.deck}
              onDraw={(card) =>
                onCardMove(card, "playerDeck", "playerHand", player.uid)
              }
              onShuffle={() => onShuffle(player.uid)}
              options={{ shuffleable: true }}
            />
          </group>
          {player.hand.map((card: Card, cardIndex: number) => (
            <CardComponent
              card={{
                ...card,
                x:
                  supplyDeckPositions(gameState)[index][0] +
                  (index === 0
                    ? (cardIndex + 1) * cardXOffset
                    : index === 2
                      ? (cardIndex + 1) * cardXOffset * -1
                      : 0),
                y:
                  supplyDeckPositions(gameState)[index][1] +
                  (index === 1
                    ? (cardIndex + 1) * cardXOffset
                    : index === 3
                      ? (cardIndex + 1) * cardXOffset * -1
                      : 0),
              }}
              rotation={[0, 0, index * (Math.PI / 2)]}
              key={card.uid}
              onDragEnd={(position) => {
                handleCardDrag(
                  card,
                  position,
                  supplyDeckPositions(gameState)[index],
                  "playerHand",
                  "playerDeck",
                  player.uid,
                );
                if (card.type === "animal") {
                  handleCardDrag(
                    card,
                    position,
                    animalDeckPosition,
                    "playerHand",
                    "animalDeck",
                    player.uid,
                  );
                }
                if (card.type === "plant") {
                  handleCardDrag(
                    card,
                    position,
                    plantDeckPosition,
                    "playerHand",
                    "plantDeck",
                    player.uid,
                  );
                }
              }}
            />
          ))}
        </>
      ))}
    </>
  );
};

export default Croupier;
