import { useState } from "react";
import {
  abilityOffset,
  cardXOffset,
  playerCardsYStart,
} from "../constants/gameBoard";
import Card from "./Card";
import Deck from "./Deck";
import AbilityTile from "./AbilityTile";
import { cardHeight } from "../constants/card";

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
  const abilities = [
    {
      name: "Move",
      x: calculateXStart(numberOfCards) - cardXOffset,
      y: playerCardsYStart + cardHeight * 0.8,
    },
    {
      name: "Refresh",
      x: calculateXStart(numberOfCards) - cardXOffset + abilityOffset,
      y: playerCardsYStart + cardHeight * 0.8,
    },
    {
      name: "Plus",
      x: calculateXStart(numberOfCards) - cardXOffset + 2 * abilityOffset,
      y: playerCardsYStart + cardHeight * 0.8,
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index} x={card.x} y={card.y} />
      ))}
      {abilities.map((ability, index) => (
        <AbilityTile key={index} x={ability.x} y={ability.y} />
      ))}
      <Deck
        x={calculateXStart(numberOfCards)}
        y={playerCardsYStart}
        color={"purple"}
        name="Supply"
        onClick={({ x, y }: { x: number; y: number }) => {
          setCards([...cards, { x, y }]);
        }}
      />
    </>
  );
};

export default PlayerCards;
