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
  GamePiece,
  GameState,
  PlantCard,
} from "@/state/types";
import { uniqBy } from "lodash-es";
import { getCardBGColor } from "@/components/utils";

type PositionedCard = Card & { x: number; y: number };

const Croupier = ({
  gameState,
  onCardMove,
  onShuffle,
}: {
  gameState: GameState;
  onCardMove: (
    card: GamePiece,
    direction: "out" | "in" | "transfer",
    deckType: "player" | "market",
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
    card: GamePiece,
    position: [number, number, number],
    comparisonPosition: [number, number, number],
    direction?: "out" | "in" | "transfer",
    deckType?: "market" | "player",
  ) => {
    if (calculateDistance(position, comparisonPosition) < 5) {
      onCardMove(card, direction ?? "in", deckType ?? "market");
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
            handleCardDrag(card, position, animalDeckPosition);
            handleCardDrag(card, position, supplyDeckPosition, "transfer");
          }}
        />
      ))}
      {drawPlantCards.map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position) => {
            handleCardDrag(card, position, plantDeckPosition);
            handleCardDrag(card, position, supplyDeckPosition, "transfer");
          }}
        />
      ))}
      {drawDisasterCards.map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position) => {
            handleCardDrag(card, position, disasterDeckPosition);
            handleCardDrag(card, position, supplyDeckPosition, "transfer");
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
            onDraw={(card) => onCardMove(card, "out", "market")}
          />
          {drawElementCards
            .filter((elementCard) => card.name === elementCard.name)
            .map((elementCard: PositionedCard) => (
              <CardComponent
                card={elementCard}
                key={elementCard.uid}
                onDragEnd={(position) => {
                  handleCardDrag(elementCard, position, [card.x, card.y, 0]);
                  handleCardDrag(
                    elementCard,
                    position,
                    supplyDeckPosition,
                    "transfer",
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
        onDraw={(card) => onCardMove(card, "out", "market")}
      />
      <Deck
        position={plantDeckPosition}
        color={"green"}
        name={`Plants \n${gameState.plantMarket.deck.length} left`}
        cards={gameState.plantMarket.deck}
        onDraw={(card) => onCardMove(card, "out", "market")}
      />
      <Deck
        position={disasterDeckPosition}
        color={"red"}
        textColor="black"
        name={`Disasters \n${gameState.disasterMarket.deck.length} left`}
        cards={gameState.disasterMarket.deck}
        onDraw={(card) => onCardMove(card, "out", "market")}
      />
      {/* Player Cards */}
      {drawPlayerCards.map((card: PositionedCard) => (
        <CardComponent
          card={card}
          key={card.uid}
          onDragEnd={(position) =>
            handleCardDrag(card, position, supplyDeckPosition, "in", "player")
          }
        />
      ))}
      <AbilityTiles />
      <Deck
        position={supplyDeckPosition}
        color="purple"
        name={`Supply \n${gameState.players[0].deck.length} left`}
        cards={gameState.players[0].deck}
        onDraw={(card) => onCardMove(card, "out", "player")}
        onShuffle={() => onShuffle("player")}
        options={{ shuffleable: true }}
      />
    </>
  );
};

export default Croupier;
