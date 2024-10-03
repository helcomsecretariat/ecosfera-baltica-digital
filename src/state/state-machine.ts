import { DeckConfig } from "@/decks/schema";
import { spawnDeck } from "@/state/deck-spawner";
import { AbilityTile, Card, CardType, GameState } from "@/state/types";
import { assignItem, replaceItem } from "@/state/utils";
import { find, reject, without } from "lodash-es";
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
          };
        }
      | {
          type: "DRAW_MARKET_CARD";
          data: {
            market_type: CardType;
          };
        }
      | {
          type: "DRAW_PLAYER_CARD"; // move a card from the supply deck to the player's hand (table)
          data: object;
        }
      | {
          type: "IDDQD";
          data: GameState;
        }
      | {
          type: "REFRESH_MARKET_DECK"; // place all table cards back into the deck and draw 4 new ones
          data: { market_type: CardType };
        }
      | {
          type: "USE_TOKEN";
          data: { token: AbilityTile };
        }
      | {
          type: "REFRESH_TOKEN";
          data: { token: AbilityTile };
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
              data: { card },
            },
          }) => {
            const marketName = `${card.type}Market` as const;
            const market = context[marketName];
            const drawnCard = market.deck.shift() as Card;
            const table = replaceItem({ uid: card.uid }, drawnCard, market.table);
            const player = find(context.players, { uid: context.activePlayerUid })!;

            return {
              players: assignItem(
                player,
                {
                  hand: [...player.hand, card],
                },
                context.players,
              ),

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
          if (!drawnCard) return {};

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
    DRAW_PLAYER_CARD: {
      actions: assign(({ context: { players, activePlayerUid } }) => {
        const player = find(players, { uid: activePlayerUid })!;
        const drawnCard = player.deck.shift();
        if (!drawnCard) return {};

        return {
          players: assignItem(
            player,
            {
              deck: reject(player.deck, drawnCard),
              hand: [...player.hand, drawnCard],
            },
            players,
          ),
        };
      }),
    },
    REFRESH_MARKET_DECK: {
      actions: [
        assign(
          ({
            context,
            event: {
              data: { market_type },
            },
          }) => {
            const market = context[`${market_type}Market`];
            const { table, deck } = market;
            const newDeck = [...deck, ...table];
            const newTable = newDeck.slice(0, 4);

            return {
              [`${market_type}Market`]: {
                ...market,
                deck: without(newDeck, ...newTable),
                table: newTable,
              },
            };
          },
        ),
      ],
    },
    IDDQD: {
      actions: [
        assign(({ context, event }) => ({
          ...context,
          ...event.data,
        })),
      ],
    },
    USE_TOKEN: {
      actions: assign(
        ({
          context: { players, activePlayerUid },
          event: {
            data: { token },
          },
        }) => ({
          players: assignItem(
            { uid: activePlayerUid },
            {
              abilities: assignItem(token, { is_used: true }, find(players, { uid: activePlayerUid })!.abilities),
            },
            players,
          ),
        }),
      ),
    },
    REFRESH_TOKEN: {
      actions: assign(
        ({
          context: { players, activePlayerUid },
          event: {
            data: { token },
          },
        }) => ({
          players: assignItem(
            { uid: activePlayerUid },
            {
              abilities: assignItem(token, { is_used: false }, find(players, { uid: activePlayerUid })!.abilities),
            },
            players,
          ),
        }),
      ),
    },
  },
});
