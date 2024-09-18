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
  const [abilities, setAbilities] = useState([
    {
      name: "Move",
      x: 0 - abilityOffset,
      y: playerCardsYStart + cardHeight * 1.2,
      available: true,
    },
    {
      name: "Refresh",
      x: 0,
      y: playerCardsYStart + cardHeight * 1.2,
      available: true,
    },
    {
      name: "Plus",
      x: 0 + abilityOffset,
      y: playerCardsYStart + cardHeight * 1.2,
      available: true,
    },
  ]);

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index} x={card.x} y={card.y} />
      ))}
      {abilities.map((ability, index) => (
        <AbilityTile
          key={index}
          x={ability.x}
          y={ability.y}
          name={ability.name}
          available={ability.available}
          onClick={() =>
            setAbilities(
              abilities.map((innerAbility, innerIndex) =>
                index === innerIndex
                  ? { ...innerAbility, available: !innerAbility.available }
                  : innerAbility,
              ),
            )
          }
        />
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
