import { AnimalCard, GameState, PlayerState } from "@/state/types";
import { concat, intersection } from "lodash";

export const getAnimalBiomePairs = (player: PlayerState): AnimalCard[][] => {
  const animalCards = player.hand.filter((card) => card.type === "animal") as AnimalCard[];
  const animalCardBiomePairs = [];

  for (let i = 0; i < animalCards.length; i++) {
    for (let j = i + 1; j < animalCards.length; j++) {
      if (intersection(animalCards[i].biomes, animalCards[j].biomes).length > 0) {
        animalCardBiomePairs.push([animalCards[i], animalCards[j]]);
      }
    }
  }

  return animalCardBiomePairs;
};

export const checkAndAssignExtinctionTile = (gameState: GameState) => {
  const player = gameState.players.find((player) => player.uid === gameState.turn.player)!;

  if (player.hand.filter((card) => card.type === "disaster").length > 2 && gameState.extinctMarket.deck.length !== 0) {
    gameState.extinctMarket.table = concat(gameState.extinctMarket.table, gameState.extinctMarket.deck[0]);
    gameState.extinctMarket.deck = gameState.extinctMarket.deck.slice(1);
  }
};
