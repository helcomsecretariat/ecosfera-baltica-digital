import Deck from "./Deck";
import Card from "./Card";
import { useState } from "react";
import {
  cardXOffset,
  cardYOffset,
  marketXStart,
  marketYStart,
} from "../constants/gameBoard";

const drawAnimalCards = () => {
  return [...Array.from(Array(4)).keys()].map((index) => ({
    x: marketXStart + (index + 1) * cardXOffset,
    y: marketYStart,
  }));
};

const drawPlantCards = () => {
  return [...Array.from(Array(4)).keys()].map((index) => ({
    x: marketXStart + (index + 1) * cardXOffset,
    y: marketYStart - cardYOffset,
  }));
};

const drawElementCards = () => {
  return [...Array.from(Array(5)).keys()].map((index) => ({
    x: marketXStart + index * cardXOffset,
    y: marketYStart - 2 * cardYOffset,
  }));
};

const Market = () => {
  const initialCards = [
    ...drawAnimalCards(),
    ...drawPlantCards(),
    ...drawElementCards(),
  ];
  const [cards, setCards] =
    useState<Array<{ x: number; y: number }>>(initialCards);

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index} x={card.x} y={card.y} />
      ))}
      <Deck
        x={marketXStart}
        y={marketYStart}
        color={"blue"}
        name="Animals"
        onClick={({ x, y }: { x: number; y: number }) => {
          setCards([...cards, { x, y }]);
        }}
      />
      <Deck
        x={marketXStart}
        y={marketYStart - cardYOffset}
        color={"green"}
        name="Plants"
        onClick={({ x, y }: { x: number; y: number }) => {
          setCards([...cards, { x, y }]);
        }}
      />
    </>
  );
};

export default Market;
