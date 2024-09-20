import Deck from "./Deck";
import Card from "./Card";
import {
  cardXOffset,
  cardYOffset,
  marketXStart,
  marketYStart,
} from "../constants/gameBoard";
import { GameState } from "./GameBoard";

const Market = ({
  gameState,
  onDraw,
}: {
  gameState: GameState;
  onDraw: (
    id: string,
    type: "animal" | "plant" | "element" | "disaster",
  ) => void;
}) => {
  const drawAnimalCards = () => {
    return gameState.animalMarket.table.map(
      (card: { name: string; id: string }, index: number) => ({
        name: card.name,
        x: marketXStart + (index + 1) * cardXOffset,
        y: marketYStart,
      }),
    );
  };
  const drawPlantCards = () => {
    return gameState.plantMarket.table.map(
      (card: { name: string; id: string }, index: number) => ({
        name: card.name,
        x: marketXStart + (index + 1) * cardXOffset,
        y: marketYStart - cardYOffset,
      }),
    );
  };
  const drawElementCards = () => {
    return gameState.elementMarket.table.map(
      (card: { name: string; id: string }, index: number) => ({
        name: card.name,
        x: marketXStart + (index + 1) * cardXOffset,
        y: marketYStart - 3 * cardYOffset,
      }),
    );
  };
  const drawDisasterCards = () => {
    return gameState.disasterMarket.table.map(
      (card: { name: string; id: string }) => ({
        name: card.name,
        x: marketXStart - 2 * cardXOffset,
        y: marketYStart - 2 * cardYOffset,
      }),
    );
  };
  const drawElementDecks = () => {
    return Array.from(
      new Set(gameState.elementMarket.deck.map((card) => card.name)),
    ).map((elementName: string, index: number) => ({
      name: elementName,
      x: marketXStart + index * cardXOffset,
      y: marketYStart - 2 * cardYOffset,
    }));
  };

  return (
    <>
      {drawAnimalCards().map((card, index) => (
        <Card name={card.name} key={index} position={[card.x, card.y, 0]} />
      ))}
      {drawPlantCards().map((card, index) => (
        <Card name={card.name} key={index} position={[card.x, card.y, 0]} />
      ))}
      {drawElementCards().map((card, index) => (
        <Card name={card.name} key={index} position={[card.x, card.y, 0]} />
      ))}
      {drawDisasterCards().map((card, index) => (
        <Card name={card.name} key={index} position={[card.x, card.y, 0]} />
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
        position={[marketXStart, marketYStart, 0]}
        color={"blue"}
        name={`Animals \n${gameState.animalMarket.deck.length} left`}
        cards={gameState.animalMarket.deck}
        onDraw={(id: string) => onDraw(id, "animal")}
      />
      <Deck
        position={[marketXStart, marketYStart - cardYOffset, 0]}
        color={"green"}
        name={`Plants \n${gameState.plantMarket.deck.length} left`}
        cards={gameState.plantMarket.deck}
        onDraw={(id: string) => onDraw(id, "plant")}
      />
      <Deck
        position={[
          marketXStart - cardXOffset,
          marketYStart - 2 * cardYOffset,
          0,
        ]}
        color={"red"}
        textColor="black"
        name={`Disasters \n${gameState.disasterMarket.deck.length} left`}
        cards={gameState.disasterMarket.deck}
        onDraw={(id: string) => onDraw(id, "disaster")}
      />
    </>
  );
};

export default Market;
