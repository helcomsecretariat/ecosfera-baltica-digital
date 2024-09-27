import {
  cardXOffset,
  cardYOffset,
  marketXStart,
  marketYStart,
  playerCardsYStart,
} from "@/constants/gameBoard";
import { default as CardComponent } from "./Card";
import { calculateDistance } from "@/utils/3d";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import {
  AnimalCard,
  Card,
  DisasterCard,
  ElementCard,
  GameState,
  PlantCard,
} from "@/state/types";
import { uniqBy } from "lodash-es";
import { getCardBGColor } from "@/components/utils";
import { cardWidth } from "@/constants/card";

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
  ) => void;
  onShuffle: (type: "player") => void;
}) => {
  const animalDeckPosition: [number, number, number] = [
    marketXStart,
    marketYStart,
    0,
  ];
  const plantDeckPosition: [number, number, number] = [
    marketXStart,
    marketYStart - cardYOffset,
    0,
  ];
  const disasterDeckPosition: [number, number, number] = [
    marketXStart - cardXOffset,
    marketYStart - 2 * cardYOffset,
    0,
  ];
  const supplyDeckPosition: [number, number, number] = [
    0 - Math.floor((gameState.players[0].hand.length + 1) / 2) * cardXOffset,
    playerCardsYStart,
    0,
  ];

  const drawAnimalCards: PositionedCard[] = gameState.animalMarket.table.map(
    (card: AnimalCard, index: number) => ({
      ...card,
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart,
    }),
  );
  const drawPlantCards: PositionedCard[] = gameState.plantMarket.table.map(
    (card: PlantCard, index: number) => ({
      ...card,
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart - cardYOffset,
    }),
  );
  const drawElementCards: PositionedCard[] = gameState.elementMarket.table.map(
    (card: ElementCard, index: number) => ({
      ...card,
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart - 3 * cardYOffset,
    }),
  );
  const drawDisasterCards: PositionedCard[] =
    gameState.disasterMarket.table.map((card: DisasterCard) => ({
      ...card,
      x: marketXStart - 2 * cardXOffset,
      y: marketYStart - 2 * cardYOffset,
    }));
  const drawElementDecks = () => {
    return uniqBy(gameState.elementMarket.deck, "name")
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((card, index: number) => {
        return {
          x: marketXStart + index * cardXOffset,
          y: marketYStart - 2 * cardYOffset,
          ...card,
        };
      });
  };
  const drawPlayerCards: PositionedCard[] = gameState.players[0].hand.map(
    (card: Card, index: number) => ({
      ...card,
      x: supplyDeckPosition[0] + (index + 1) * cardXOffset,
      y: playerCardsYStart,
    }),
  );

  const handleCardDrag = (
    card: Card,
    position: [number, number, number],
    comparisonPosition: [number, number, number],
    origin: CardMoveLocation,
    destination: CardMoveLocation,
  ) => {
    if (calculateDistance(position, comparisonPosition) < 5) {
      onCardMove(card, origin, destination);
    }
  };

  return (
    <>
      {/* Market Cards */}
      {drawAnimalCards.map((card: PositionedCard) => (
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
            handleCardDrag(
              card,
              position,
              supplyDeckPosition,
              "animalTable",
              "playerDeck",
            );
          }}
        />
      ))}
      {drawPlantCards.map((card: PositionedCard) => (
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
            handleCardDrag(
              card,
              position,
              supplyDeckPosition,
              "plantTable",
              "playerDeck",
            );
          }}
        />
      ))}
      {drawDisasterCards.map((card: PositionedCard) => (
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
            handleCardDrag(
              card,
              position,
              supplyDeckPosition,
              "disasterTable",
              "playerDeck",
            );
          }}
        />
      ))}
      {drawElementDecks().map((card, index) => (
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
          {drawElementCards
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
                  handleCardDrag(
                    elementCard,
                    position,
                    supplyDeckPosition,
                    "elementTable",
                    "plantDeck",
                  );
                }}
              />
            ))}
        </group>
      ))}
      <Deck
        position={animalDeckPosition}
        color={"blue"}
        name={`Animals \n${gameState.animalMarket.deck.length} left`}
        cards={gameState.animalMarket.deck}
        onDraw={(card) => onCardMove(card, "animalDeck", "animalTable")}
      />
      <Deck
        position={plantDeckPosition}
        color={"green"}
        name={`Plants \n${gameState.plantMarket.deck.length} left`}
        cards={gameState.plantMarket.deck}
        onDraw={(card) => onCardMove(card, "plantDeck", "plantTable")}
      />
      <Deck
        position={disasterDeckPosition}
        color={"red"}
        textColor="black"
        name={`Disasters \n${gameState.disasterMarket.deck.length} left`}
        cards={gameState.disasterMarket.deck}
        onDraw={(card) => onCardMove(card, "disasterDeck", "disasterTable")}
      />
      {/* Player Cards */}
      {drawPlayerCards.map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position) => {
            handleCardDrag(
              card,
              position,
              supplyDeckPosition,
              "playerHand",
              "playerDeck",
            );
            if (card.type === "animal") {
              handleCardDrag(
                card,
                position,
                animalDeckPosition,
                "playerHand",
                "animalDeck",
              );
            }
            if (card.type === "plant") {
              handleCardDrag(
                card,
                position,
                plantDeckPosition,
                "playerHand",
                "plantDeck",
              );
            }
          }}
        />
      ))}
      <AbilityTiles xStart={supplyDeckPosition[0] - 1.5 * cardWidth} />
      <Deck
        position={supplyDeckPosition}
        color="purple"
        name={`Supply \n${gameState.players[0].deck.length} left`}
        cards={gameState.players[0].deck}
        onDraw={(card) => onCardMove(card, "playerDeck", "playerHand")}
        onShuffle={() => onShuffle("player")}
        options={{ shuffleable: true }}
      />
    </>
  );
};

export default Croupier;
