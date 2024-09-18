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

const drawElementCards = () => {
  return [...Array.from(Array(5)).keys()].map((index) => ({
    x: marketXStart + index * cardXOffset,
    y: marketYStart - 2 * cardYOffset,
  }));
};

const Market = ({ gameState }: { gameState: any }) => {
  const drawAnimalCards = () => {
    return gameState.animalMarket.table.map((card: any, index: number) => ({
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart,
    }));
  };
  const drawPlantCards = () => {
    return gameState.plantMarket.table.map((card: any, index: number) => ({
      x: marketXStart + (index + 1) * cardXOffset,
      y: marketYStart - cardYOffset,
    }));
  };

  const initialCards = [...drawAnimalCards(), ...drawPlantCards()];
  const [cards, setCards] =
    useState<Array<{ x: number; y: number }>>(initialCards);
  console.log(drawElementCards());

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index} x={card.x} y={card.y} />
      ))}
      {drawElementCards().map((card, index) => (
        <Deck
          key={index}
          name="Elements"
          color="gray"
          textColor="black"
          x={card.x}
          y={card.y}
          onClick={({ x, y }: { x: number; y: number }) => {
            setCards([...cards, { x, y }]);
          }}
        />
      ))}
      <Deck
        x={marketXStart}
        y={marketYStart}
        color={"blue"}
        name={`Animals \n${gameState.animalMarket.deck.length} left`}
        onClick={({ x, y }: { x: number; y: number }) => {
          setCards([...cards, { x, y }]);
        }}
      />
      <Deck
        x={marketXStart}
        y={marketYStart - cardYOffset}
        color={"green"}
        name={`Plants \n${gameState.plantMarket.deck.length} left`}
        onClick={({ x, y }: { x: number; y: number }) => {
          setCards([...cards, { x, y }]);
        }}
      />
      <Deck
        x={marketXStart - cardXOffset}
        y={marketYStart - 2 * cardYOffset}
        color={"red"}
        textColor="black"
        name="Disasters"
        onClick={({ x, y }: { x: number; y: number }) => {
          setCards([...cards, { x, y }]);
        }}
      />
    </>
  );
};

export default Market;
