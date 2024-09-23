import {
  cardXOffset,
  cardYOffset,
  marketXStart,
  marketYStart,
  playerCardsYStart,
} from "@/constants/gameBoard";
import { GameState } from "./GameBoard";
import { default as CardComponent } from "./Card";
import { calculateDistance } from "@/utils/3d";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";
import { Card } from "@/types/general";

type PositionedCard = Card & { x: number; y: number };

const Croupier = ({
  gameState,
  onDraw,
  onShuffle,
}: {
  gameState: GameState;
  onDraw: (
    id: string,
    type: "animal" | "plant" | "element" | "disaster" | "player",
    direction?: "out" | "in" | "transfer",
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
    0 - Math.floor((gameState.players[0].table.length + 1) / 2) * cardXOffset,
    playerCardsYStart,
    0,
  ];
  const drawAnimalCards: PositionedCard[] = gameState.animalMarket.table.map(
    (card: Card, index: number) => ({
      ...card,
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart,
    }),
  );
  const drawPlantCards: PositionedCard[] = gameState.plantMarket.table.map(
    (card: Card, index: number) => ({
      ...card,
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart - cardYOffset,
    }),
  );
  const drawElementCards: PositionedCard[] = gameState.elementMarket.table.map(
    (card: Card, index: number) => ({
      ...card,
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart - 3 * cardYOffset,
    }),
  );
  const drawDisasterCards: PositionedCard[] =
    gameState.disasterMarket.table.map((card: Card) => ({
      ...card,
      x: marketXStart - 2 * cardXOffset,
      y: marketYStart - 2 * cardYOffset,
    }));
  const drawElementDecks = () => {
    return Array.from(
      new Set(gameState.elementMarket.deck.map((card: Card) => card.name)),
    ).map((elementName: string, index: number) => {
      return {
        name: elementName,
        x: marketXStart + index * cardXOffset,
        y: marketYStart - 2 * cardYOffset,
      };
    });
  };
  const drawPlayerCards: PositionedCard[] = gameState.players[0].table.map(
    (card: Card, index: number) => ({
      ...card,
      x: supplyDeckPosition[0] + (index + 1) * cardXOffset,
      y: playerCardsYStart,
    }),
  );

  const handleCardDrag = (
    id: string,
    position: [number, number, number],
    comparisonPosition: [number, number, number],
    cardType: "animal" | "plant" | "disaster" | "player",
    direction?: "out" | "in" | "transfer",
  ) => {
    if (calculateDistance(position, comparisonPosition) < 5) {
      onDraw(id, cardType, direction ?? "in");
    }
  };

  return (
    <>
      {/* Market Cards */}
      {drawAnimalCards.map((card: PositionedCard) => (
        <CardComponent
          name={card.name}
          key={card.id}
          position={[card.x, card.y, 0]}
          onDragEnd={(position: [number, number, number]) => {
            handleCardDrag(card.id, position, animalDeckPosition, "animal");
            handleCardDrag(
              card.id,
              position,
              supplyDeckPosition,
              "animal",
              "transfer",
            );
          }}
        />
      ))}
      {drawPlantCards.map((card: PositionedCard) => (
        <CardComponent
          name={card.name}
          key={card.id}
          position={[card.x, card.y, 0]}
          onDragEnd={(position) => {
            handleCardDrag(card.id, position, plantDeckPosition, "plant");
            handleCardDrag(
              card.id,
              position,
              supplyDeckPosition,
              "plant",
              "transfer",
            );
          }}
        />
      ))}
      {drawElementCards.map((card: PositionedCard) => (
        <CardComponent
          name={card.name}
          key={card.id}
          position={[card.x, card.y, 0]}
        />
      ))}
      {drawDisasterCards.map((card: PositionedCard) => (
        <CardComponent
          name={card.name}
          key={card.id}
          position={[card.x, card.y, 0]}
          onDragEnd={(position) => {
            handleCardDrag(card.id, position, disasterDeckPosition, "disaster");
            handleCardDrag(
              card.id,
              position,
              supplyDeckPosition,
              "disaster",
              "transfer",
            );
          }}
        />
      ))}
      {drawElementDecks().map((card, index) => (
        <Deck
          key={index}
          name={`${card.name}\n${
            gameState.elementMarket.deck.filter(
              (elementCard) => elementCard.name === card.name,
            ).length
          } left`}
          color="gray"
          textColor="black"
          position={[card.x, card.y, 0]}
          cards={gameState.elementMarket.deck.filter(
            (elementCard) => elementCard.name === card.name,
          )}
          onDraw={(id: string) => onDraw(id, "element")}
        />
      ))}
      <Deck
        position={animalDeckPosition}
        color={"blue"}
        name={`Animals \n${gameState.animalMarket.deck.length} left`}
        cards={gameState.animalMarket.deck}
        onDraw={(id: string) => onDraw(id, "animal")}
      />
      <Deck
        position={plantDeckPosition}
        color={"green"}
        name={`Plants \n${gameState.plantMarket.deck.length} left`}
        cards={gameState.plantMarket.deck}
        onDraw={(id: string) => onDraw(id, "plant")}
      />
      <Deck
        position={disasterDeckPosition}
        color={"red"}
        textColor="black"
        name={`Disasters \n${gameState.disasterMarket.deck.length} left`}
        cards={gameState.disasterMarket.deck}
        onDraw={(id: string) => onDraw(id, "disaster")}
      />

      {/* Player Cards */}
      {drawPlayerCards.map((card: PositionedCard) => (
        <CardComponent
          name={card.name}
          key={card.id}
          position={[card.x, card.y, 0]}
          onDragEnd={(position) =>
            handleCardDrag(card.id, position, supplyDeckPosition, "player")
          }
        />
      ))}
      <AbilityTiles />
      <Deck
        position={supplyDeckPosition}
        color="purple"
        name="Supply"
        cards={gameState.players[0].deck}
        onDraw={(id: string) => onDraw(id, "player")}
        onShuffle={() => onShuffle("player")}
        options={{ shuffleable: true }}
      />
    </>
  );
};

export default Croupier;
