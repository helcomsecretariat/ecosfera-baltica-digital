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
        <Card name="Name" key={index} position={[card.x, card.y, 0]} />
      ))}
      <AbilityTiles />
      <Deck
        position={[calculateXStart(numberOfCards), playerCardsYStart, 0]}
        color="purple"
        name="Supply"
        cards={[]}
        onDraw={() => {}}
      />
    </>
  );
};

export default PlayerCards;
