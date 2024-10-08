import { AnimalCard, Card, ElementCard, GameState, PlantCard } from "@/state/types";
import { find, without } from "lodash";
import { setup, assign, sendParent } from "xstate";
import { produce } from "immer";
import { BuyMachineGuards } from "./guards/buy";

export type BuyMachineOutEvents =
  | { type: "buy.card"; card: PlantCard | AnimalCard }
  | { type: "buy.iddqd"; context: GameState };
export type BuyMachineInEvents =
  | { type: "user.click.player.hand.card"; card: PlantCard | AnimalCard | ElementCard }
  | { type: "user.click.market.deck.element"; name: ElementCard["name"] }
  | { type: "user.click.market.table.card"; card: PlantCard | AnimalCard };

export const BuyMachine = setup({
  types: {
    context: {} as GameState,
    input: {} as {
      context: GameState;
    },
    events: {} as
      | { type: "user.click.player.hand.card"; card: PlantCard | AnimalCard | ElementCard }
      | { type: "user.click.market.deck.element"; name: ElementCard["name"] }
      | { type: "user.click.market.table.card"; card: PlantCard | AnimalCard },
  },
  actions: {
    borrowElement: assign(({ context }: { context: GameState }, name: ElementCard["name"]) =>
      produce(context, (draft) => {
        const card = find(draft.elementMarket.deck, { name });
        if (!card) return;
        draft.turn.borrowedElement = card;
      }),
    ),
    playCard: assign(({ context }: { context: GameState }, uid: Card["uid"]) =>
      produce(context, (draft) => {
        draft.turn.playedCards.push(uid);
      }),
    ),
    unPlayCard: assign(({ context }: { context: GameState }, uid: Card["uid"]) =>
      produce(context, (draft) => {
        draft.turn.playedCards = without(draft.turn.playedCards, uid);
      }),
    ),
  },
  guards: {
    notPlayedCard: BuyMachineGuards.notPlayedCard,
    notExhausted: BuyMachineGuards.notExhausted,
    canBorrow: BuyMachineGuards.canBorrow,
    canBuyCard: BuyMachineGuards.canBuyCard,
  },
}).createMachine({
  context: ({ input: { context } }) => context,
  id: "buy",
  initial: "idle",

  states: {
    updateTurnState: {
      entry: sendParent(({ context }) => ({ type: "buy.iddqd", context })),
      always: { target: "idle" },
    },

    idle: {
      on: {
        "user.click.market.deck.element": {
          actions: { type: "borrowElement", params: ({ event: { name } }) => name },
          guard: "canBorrow",
          target: "#buy.updateTurnState",
        },
        "user.click.player.hand.card": [
          {
            target: "#buy.updateTurnState",
            actions: {
              type: "playCard",
              params: ({ event: { card } }) => card.uid,
            },
            guard: { type: "notPlayedCard", params: ({ event: { card } }) => card.uid },
          },
          {
            target: "#buy.updateTurnState",
            actions: {
              type: "unPlayCard",
              params: ({ event: { card } }) => card.uid,
            },
            guard: {
              type: "notExhausted",
              params: ({ event: { card } }) => card.uid,
            },
          },
        ],
        "user.click.market.table.card": {
          actions: sendParent(({ event: { card } }) => ({ type: "buy.card", card })),
          guard: { type: "canBuyCard", params: ({ event: { card } }) => card },
        },
      },
    },
  },
});
