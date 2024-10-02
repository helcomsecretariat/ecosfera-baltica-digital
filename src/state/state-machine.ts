import { DeckConfig } from "@/decks/schema";
import { spawnDeck } from "@/state/deck-spawner";
import { Card, CardType, GameState, PlayerState } from "@/state/types";
import { findIndex, reject } from "lodash-es";
import { assign, setup } from "xstate";

export default setup({
  types: {
    context: {} as GameState,
    input: {} as {
      config: DeckConfig;
      numberOfPlayers: number;
      seed: string;
    },
    events: {} as
      | {
          type: "BUY_MARKET_CARD";
          data: {
            card: Card;
            player: PlayerState;
          };
        }
      | {
          type: "DRAW_MARKET_CARD";
          data: {
            market_type: CardType;
          };
        }
      | {
          type: "IDDQD";
          data: GameState;
        },
  },
}).createMachine({
  context: ({ input: { config, numberOfPlayers, seed } }) => spawnDeck(config, numberOfPlayers, seed),
  on: {
    BUY_MARKET_CARD: {
      actions: [
        assign(
          ({
            context,
            event: {
              data: { card, player },
            },
          }) => {
            const marketName = `${card.type}Market` as const;
            const market = context[marketName];
            const drawnCard = market.deck.shift() as Card;
            //@ts-expect-error TS is confused
            const cardIndex = findIndex(market.table, { uid: card.uid });
            const table = [...market.table];
            table[cardIndex] = drawnCard;

            return {
              players: [
                ...reject(context.players, player),
                {
                  ...player,
                  hand: [...player.hand, card],
                },
              ],
              [marketName]: {
                ...context[marketName],
                table,
              },
            };
          },
        ),
        // raise(({ event }) => ({
        //   type: "DRAW_MARKET_CARD",
        //   data: { market_type: event.data.card.type },
        // })),
      ],
    },
    DRAW_MARKET_CARD: {
      actions: assign(
        ({
          context,
          event: {
            data: { market_type },
          },
        }) => {
          const market = context[`${market_type}Market`];
          const drawnCard = market.deck.shift();

          return {
            [`${market_type}Market`]: {
              ...market,
              deck: reject(market.deck, drawnCard),
              table: [...market.table, drawnCard],
            },
          };
        },
      ),
    },
    IDDQD: {
      actions: [
        assign(({ context, event }) => ({
          ...context,
          ...event.data,
        })),
      ],
    },
  },
});
