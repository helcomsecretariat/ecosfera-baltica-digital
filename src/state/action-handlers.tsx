import { TurnMachine } from "@/state/machines/turn";
import { AbilityTile, AnimalCard, PlantCard, ElementCard } from "@/state/types";
import { EventFromLogic } from "xstate";

export interface StateHandlers {
  playerCardClick: (card: PlantCard | AnimalCard | ElementCard) => () => void;
  playerDeckClick: () => () => void;
  marketElementClick: (name: ElementCard["name"]) => () => void;
  marketCardClick: (card: PlantCard | AnimalCard) => () => void;
  tokenClick: (token: AbilityTile) => () => void;
  animalDeckClick: () => () => void;
  plantDeckClick: () => () => void;
  // useToken: (token: AbilityTile) => () => void;
}

export const createStateHandlers = (send: (e: EventFromLogic<typeof TurnMachine>) => void): StateHandlers => {
  const sendEvent =
    <T extends EventFromLogic<typeof TurnMachine>>(event: T) =>
    () => {
      send(event);
    };

  return {
    playerCardClick: (card: PlantCard | AnimalCard | ElementCard) =>
      sendEvent({ type: "user.click.player.hand.card", card }),
    playerDeckClick: () => sendEvent({ type: "user.click.player.deck" }),
    marketElementClick: (name: ElementCard["name"]) => sendEvent({ type: "user.click.market.deck.element", name }),
    marketCardClick: (card: PlantCard | AnimalCard) => sendEvent({ type: "user.click.market.table.card", card }),
    animalDeckClick: () => sendEvent({ type: "user.click.market.deck.animal" }),
    plantDeckClick: () => sendEvent({ type: "user.click.market.deck.plant" }),
    tokenClick: (token: AbilityTile) => sendEvent({ type: "user.click.token", token }),
  };
};
