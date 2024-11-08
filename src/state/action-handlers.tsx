import { TurnMachine, TurnMachineContext } from "@/state/machines/turn";
import { AbilityTile, AnimalCard, PlantCard, ElementCard, Card, GameState, AbilityName } from "@/state/types";
import { mapValues } from "lodash-es";
import { EventFromLogic } from "xstate";
import { ContextInjectedGuardMap, TurnMachineGuards } from "./machines/guards";

export interface ActionEmmiters {
  playerCardClick: (card: Card) => () => void;
  playerDeckClick: () => () => void;
  playerEndTurnClick: () => () => void;
  marketElementClick: (name: ElementCard["name"]) => () => void;
  borrowedElementClick: (card: ElementCard) => () => void;
  marketCardClick: (card: PlantCard | AnimalCard) => () => void;
  tokenClick: (token: AbilityTile) => () => void;
  cardTokenClick: (card: AnimalCard | PlantCard, abilityName: AbilityName) => () => void;
  animalDeckClick: () => () => void;
  plantDeckClick: () => () => void;
  stageConfirm: () => () => void;
  iddqd: (context: Partial<TurnMachineContext>) => () => void;
}

export type ActionTesters = {
  [K in keyof ActionEmmiters]: (...args: Parameters<ActionEmmiters[K]>) => boolean;
};

const actionToEventMap: {
  [K in keyof ActionEmmiters]: (...args: Parameters<ActionEmmiters[K]>) => EventFromLogic<typeof TurnMachine>;
} = {
  playerCardClick: (card: Card) => ({ type: "user.click.player.hand.card", card }),
  playerDeckClick: () => ({ type: "user.click.player.deck" }),
  playerEndTurnClick: () => ({ type: "user.click.player.endTurn" }),
  marketElementClick: (name: ElementCard["name"]) => ({ type: "user.click.market.deck.element", name }),
  borrowedElementClick: (card: ElementCard) => ({ type: "user.click.market.borrowed.card.element", card }),
  marketCardClick: (card: PlantCard | AnimalCard) => ({ type: "user.click.market.table.card", card }),
  animalDeckClick: () => ({ type: "user.click.market.deck.animal" }),
  plantDeckClick: () => ({ type: "user.click.market.deck.plant" }),
  tokenClick: (token: AbilityTile) => ({ type: "user.click.token", token }),
  cardTokenClick: (card: AnimalCard | PlantCard, abilityName: AbilityName) => ({
    type: "user.click.player.hand.card.token",
    card,
    abilityName,
  }),
  stageConfirm: () => ({ type: "user.click.stage.confirm" }),
  iddqd: (context: Partial<TurnMachineContext>) => ({ type: "iddqd", context }),
} as const;

export const createEmmiters = (send: (e: EventFromLogic<typeof TurnMachine>) => void): ActionEmmiters => {
  return mapValues(actionToEventMap, (value) => {
    return (...args: Parameters<typeof value>) => {
      // @ts-expect-error dunno how to correctly type this
      const event = value(...args) as EventFromLogic<typeof TurnMachine>;
      return () => {
        send(event);
      };
    };
  });
};

export const createTesters = (can: (e: EventFromLogic<typeof TurnMachine>) => boolean) => {
  return mapValues(actionToEventMap, (value) => {
    return (...args: Parameters<typeof value>) => {
      // @ts-expect-error dunno how to correctly type this
      const event = value(...args) as EventFromLogic<typeof TurnMachine>;
      return can(event);
    };
  });
};

export const createGuards = (context: GameState): ContextInjectedGuardMap => {
  return Object.fromEntries(
    Object.entries(TurnMachineGuards).map(([key, guardFn]) => [
      key,
      // @ts-expect-error dunno how to correctly type this
      (...args: Parameters<(typeof TurnMachineGuards)[typeof key]>) => guardFn({ context }, ...args),
    ]),
  ) as ContextInjectedGuardMap;
};
