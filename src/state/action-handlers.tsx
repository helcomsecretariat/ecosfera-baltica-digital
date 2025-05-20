import { TurnMachine, TurnMachineContext } from "@/state/machines/turn";
import {
  AbilityTile,
  AnimalCard,
  PlantCard,
  ElementCard,
  Card,
  GameState,
  AbilityName,
  PolicyCard,
  HabitatName,
} from "@/state/types";
import { mapValues } from "lodash-es";
import { EventFromLogic } from "xstate";
import { ContextInjectedGuardMap, TurnMachineGuards } from "./machines/guards";

// Type to make it clear that these functions return functions that need to be called
type EmitterFunction<T extends readonly unknown[]> = (...args: T) => () => void;

export interface ActionEmmiters {
  playerCardClick: EmitterFunction<[card: Card]>;
  playerDeckClick: EmitterFunction<[]>;
  playerEndTurnClick: EmitterFunction<[]>;
  habitatTileClick: EmitterFunction<[name: HabitatName]>;
  marketElementClick: EmitterFunction<[name: ElementCard["name"]]>;
  borrowedElementClick: EmitterFunction<[card: ElementCard]>;
  marketCardClick: EmitterFunction<[card: PlantCard | AnimalCard]>;
  tokenClick: EmitterFunction<[token: AbilityTile]>;
  cardTokenClick: EmitterFunction<[card: AnimalCard | PlantCard, abilityName: AbilityName]>;
  animalDeckClick: EmitterFunction<[]>;
  plantDeckClick: EmitterFunction<[]>;
  stageConfirm: EmitterFunction<[]>;
  stageShowCards: EmitterFunction<[]>;
  stageHideCards: EmitterFunction<[]>;
  iddqd: EmitterFunction<[context: Partial<TurnMachineContext>]>;
  acquiredPolicyCardClick: EmitterFunction<[card: PolicyCard]>;
  cancelPolicyCard: EmitterFunction<[]>;
  cancelAbility: EmitterFunction<[]>;
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
  habitatTileClick: (name: HabitatName) => ({ type: "user.click.market.deck.habitat", name }),
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
  stageShowCards: () => ({ type: "user.click.stage.showCards" }),
  stageHideCards: () => ({ type: "user.click.stage.hideCards" }),
  iddqd: (context: Partial<TurnMachineContext>) => ({ type: "iddqd", context }),
  acquiredPolicyCardClick: (card: PolicyCard) => ({ type: "user.click.policy.card.acquired", card }),
  cancelPolicyCard: () => ({ type: "user.click.policies.cancel" }),
  cancelAbility: () => ({ type: "user.click.ability.cancel" }),
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
