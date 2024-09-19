import { useState } from "react";
import { cardXOffset, playerCardsYStart } from "../constants/gameBoard";
import Card from "./Card";
import Deck from "./Deck";
import AbilityTiles from "./AbilityTiles";

const numberOfCards = 4;

const drawPlayerCards = () => {
  return [...Array.from(Array(numberOfCards)).keys()].map((index) => ({
    x: calculateXStart(numberOfCards) + (index + 1) * cardXOffset,
    y: playerCardsYStart,
  }));
};

const calculateXStart = (numberOfCards: number) => {
  return 0 - Math.floor((numberOfCards + 1) / 2) * cardXOffset;
};

const PlayerCards = () => {
  const [cards, setCards] = useState(drawPlayerCards());

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index} x={card.x} y={card.y} />
      ))}
      <AbilityTiles />
      <Deck
        x={calculateXStart(numberOfCards)}
        y={playerCardsYStart}
        color="purple"
        name="Supply"
        onClick={({ x, y }: { x: number; y: number }) => {
          setCards([...cards, { x, y }]);
        }}
      />
    </>
  );
};

export default PlayerCards;
