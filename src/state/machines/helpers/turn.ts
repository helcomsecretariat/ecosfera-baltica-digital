import { AnimalCard, GameState } from "@/state/types";
import { find, intersection } from "lodash";

export const getAnimalHabitatPairs = (animalCards: AnimalCard[]): AnimalCard[][] => {
  const animalCardHabitatPairs = [];

  for (let i = 0; i < animalCards.length; i++) {
    for (let j = i + 1; j < animalCards.length; j++) {
      if (intersection(animalCards[i].habitats, animalCards[j].habitats).length > 0) {
        animalCardHabitatPairs.push([animalCards[i], animalCards[j]]);
      }
    }
  }

  return animalCardHabitatPairs;
};

export const getSharedHabitats = (animalCards: AnimalCard[]): string[] => {
  const habitatCounts: { [key: string]: number } = {};

  animalCards.forEach((animalCard) => {
    animalCard.habitats.forEach((habitat) => {
      if (habitatCounts[habitat]) {
        habitatCounts[habitat] += 1;
      } else {
        habitatCounts[habitat] = 1;
      }
    });
  });

  return Object.entries(habitatCounts)
    .filter(([_, count]) => count > 1)
    .map(([key]) => key);
};

export const getPlayedAnimalsForHabitatUnlock = ({ context }: { context: GameState }) => {
  const player = find(context.players, { uid: context.turn.player })!;
  const playedAnimals = player.hand
    .filter(({ uid }) => context.turn.playedCards.includes(uid))
    .filter(({ type }) => type === "animal") as AnimalCard[];

  // Select only the first two played animals that share a habitat
  const animalHabitatPairs = playedAnimals.reduce((acc, animal) => {
    if (acc.length === 2) return acc;

    const matchingAnimal = playedAnimals.find((otherAnimal) => {
      if (otherAnimal === animal) return false;
      const sharedHabitats = intersection(otherAnimal.habitats, animal.habitats);
      return sharedHabitats.some(
        (habitat) => !context.habitatMarket.deck.find((tile) => tile.name === habitat && tile.isAcquired),
      );
    });

    return matchingAnimal && acc.length < 2 ? [matchingAnimal, animal] : acc;
  }, [] as AnimalCard[]);

  return animalHabitatPairs;
};

export const getDuplicateElements = (gameState: GameState, numberOfDuplicates: number) => {
  const player = find(gameState.players, { uid: gameState.turn.player });
  const elementCounts: { [key: string]: number } = {};

  player?.hand
    .filter((card) => card.type === "element")
    .forEach((card) => {
      if (elementCounts[card.name]) {
        elementCounts[card.name] += 1;
      } else {
        elementCounts[card.name] = 1;
      }
    });

  const duplicateElements = Object.keys(elementCounts).filter(
    (element) => elementCounts[element] >= numberOfDuplicates,
  );

  return duplicateElements;
};
