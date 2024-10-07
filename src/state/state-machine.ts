// import { DeckConfig } from "@/decks/schema";
// import { spawnDeck } from "@/state/deck-spawner";
// import { AbilityMachine } from "@/state/machines/ability";
// import { inspect } from "@/state/machines/utils";
// import { AbilityTile, AnimalCard, Card, ElementCard, GameState, Market, PlantCard } from "@/state/types";
// import { assignItem, replaceItem } from "@/state/utils";
// import { find, reject, without } from "lodash-es";
// import { assign, raise, sendTo, setup } from "xstate";

// export const GameStateMachine = setup({
//   types: {
//     context: {} as GameState,
//     input: {} as {
//       config: DeckConfig;
//       numberOfPlayers: number;
//       seed: string;
//     },
//     events: {} as
//       | {
//           type: "BUY_MARKET_CARD";
//           data: {
//             card: Card;
//           };
//         }
//       | {
//           type: "DRAW_MARKET_CARD";
//           data: (Market<AnimalCard> | Market<PlantCard>)["type"];
//         }
//       | {
//           type: "DRAW_PLAYER_CARD";
//         }
//       | {
//           type: "IDDQD";
//           data: GameState;
//         }
//       | { type: "REFRESH_ANIMAL_MARKET" }
//       | { type: "REFRESH_PLANT_MARKET" }
//       | {
//           type: "REFRESH_MARKET";
//           data: (Market<AnimalCard> | Market<PlantCard>)["type"];
//         }
//       | {
//           type: "TOKEN_CLICK";
//           token: AbilityTile;
//         }
//       // strange names easier type inference
//       // avoiding cringe like USE_ABILITY_${token.name.toUpperCase() as Uppercase<typeof token.name>}` as const
//       | { type: "USE_ABILITY_refresh" }
//       | { type: "USE_ABILITY_move" }
//       | { type: "USE_ABILITY_plus" }
//       | { type: "USE_ABILITY_special" }
//       | { type: "CARD_CLICK"; data: { card: Card } }
//       | { type: "ANIMAL_DECK_CLICK" }
//       | { type: "PLANT_DECK_CLICK" }
//       | { type: "ELEMENT_DECK_CLICK"; data: { name: ElementCard["name"] } }
//       | { type: "DISASTER_DECK_CLICK" }
//       | { type: "CANCEL" },
//   },

//   actors: {
//     ability: AbilityMachine,
//   },
//   actions: {
//     setAbilityUsed: () => console.error("implement setAbilityUsed"),
//     setAbilityNotUsed: () => console.error("implement setAbilityNotUsed"),
//   },
// }).createMachine({
//   /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswDoAuBXATgHYDEAQgKoCaA+gLICCASgNICiAKtQMJMAiA2gAYAuolAAHAPawAlthmTCYkAA9EAZkEAWTADZdAVgCcRg+q3GTugDQgAnogBMAdgCMmABzPH6o4PW6HupBjgC+obaoGDgEJLyM9ADqdExsnDyMAiLKUrLyispqCI5GzpjGHl7GWuoBQbYOCB7u6o4ljjW6RrqaAeGR6Fh4RMTxSdQACgAy9JSsjNx8QqJIILlyCkqrRSVGmCauWs7OWlqOBq76DYiuzrrlpbpH2r7a+v0gUUOxxIysAGJ-ADKAAkUiwOMsctINgVthpXIJMBY3rdHB5zhj1NcECcPJgSpdvB4uoJXJcPl8YiMAJK8XgARSyKwkMPyW1ARXUBgMmFagkxbwMKJs9kQhnUmDJXWcgg8pyMWkOlMG1JI7AA8mwAHLcKY0rjMKGrdbswo3dTOHFHdxGVyvcyuRWGXTOFXRYaETAoABGMgANnI7MQIIosDJCAA3SQAaywVM93r9gewdgQEejAGMUOzlsbWXlNuaEDapT5LYJBIEDI5bjia-iTtz0Y5BLLvLp3d8iEmA0HiGB8PhJPhMOJ-TmAGYjtCYBOxXsptMZyTZ3MifNrNlF+Eltxl2qyqseGt1sUlgLIo8ngxdVsBTsfQiSCBwZRfaGFuGcxBKnEAWnuStgJA0C3QiT5VU9T9YQ5VREA8IwcXMPZDjcWo7xJW5HwGD0FxkCB-TAGCzV3QxeUQ9RXFrS0jEQ9FrUMTByQFZwTxCAw7i7NVFyDEidx-BBNEcTA7luF45SMS0T2tLR8X0dC2krIwXHCcIgA */
//   inspect,
//   context: ({ input: { config, numberOfPlayers, seed } }) => spawnDeck(config, numberOfPlayers, seed),

//   id: "game",
//   initial: "turn",

//   states: {
//     turn: {
//       initial: "idle",
//       on: {
//         BUY_MARKET_CARD: {
//           actions: [
//             assign(
//               ({
//                 context,
//                 event: {
//                   data: { card },
//                 },
//               }) => {
//                 const marketName = `${card.type}Market` as const;
//                 const market = context[marketName];
//                 const drawnCard = market.deck.shift() as Card;
//                 const table = replaceItem({ uid: card.uid }, drawnCard, market.table);
//                 const player = find(context.players, { uid: context.activePlayerUid })!;

//                 return {
//                   players: assignItem(
//                     player,
//                     {
//                       hand: [...player.hand, card],
//                     },
//                     context.players,
//                   ),

//                   [marketName]: {
//                     ...context[marketName],
//                     table,
//                   },
//                 };
//               },
//             ),
//           ],
//         },
//         DRAW_MARKET_CARD: {
//           actions: assign(({ context, event: { data: marketType } }) => {
//             const market = context[`${marketType}Market`];
//             const drawnCard = market.deck.shift();
//             if (!drawnCard) return {};

//             return {
//               [`${marketType}Market`]: {
//                 ...market,
//                 deck: reject(market.deck, drawnCard),
//                 table: [...market.table, drawnCard],
//               },
//             };
//           }),
//         },
//         DRAW_PLAYER_CARD: {
//           actions: assign(({ context: { players, activePlayerUid } }) => {
//             const player = find(players, { uid: activePlayerUid })!;
//             const drawnCard = player.deck.shift();
//             if (!drawnCard) return {};

//             return {
//               players: assignItem(
//                 player,
//                 {
//                   deck: reject(player.deck, drawnCard),
//                   hand: [...player.hand, drawnCard],
//                 },
//                 players,
//               ),
//             };
//           }),
//         },
//         REFRESH_ANIMAL_MARKET: {
//           actions: raise({ type: "REFRESH_MARKET", data: "animal" }),
//         },
//         REFRESH_PLANT_MARKET: {
//           actions: raise({ type: "REFRESH_MARKET", data: "plant" }),
//         },
//         REFRESH_MARKET: {
//           actions: [
//             assign(({ context, event: { data: marketType } }) => {
//               const market = context[`${marketType}Market`];
//               const { table, deck } = market;
//               const newDeck = [...deck, ...table];
//               const newTable = newDeck.slice(0, 4);

//               return {
//                 [`${marketType}Market`]: {
//                   ...market,
//                   deck: without(newDeck, ...newTable),
//                   table: newTable,
//                 },
//               };
//             }),
//           ],
//         },
//         IDDQD: {
//           actions: [
//             assign(({ context, event }) => ({
//               ...context,
//               ...event.data,
//             })),
//           ],
//         },
//       },

//       states: {
//         idle: {
//           on: {
//             ANIMAL_DECK_CLICK: {
//               actions: raise({ type: "DRAW_MARKET_CARD", data: "animal" }),
//             },
//             PLANT_DECK_CLICK: {
//               actions: raise({ type: "DRAW_MARKET_CARD", data: "plant" }),
//             },
//             TOKEN_CLICK: {
//               target: "#game.turn.ability",
//               actions: assign({ currentAbility: ({ event: { token } }) => ({ piece: token, name: token.name }) }),
//             },
//           },
//         },
//         ability: {
//           on: {
//             "*": {
//               actions: sendTo("ability", ({ event }) => event),
//             },
//           },
//           invoke: {
//             id: "ability",
//             src: "ability",
//             input: ({ context: { currentAbility } }) => currentAbility!,
//             onDone: {
//               target: "idle",
//               actions: "setAbilityUsed",
//             },
//             onError: {
//               target: "idle",
//               actions: "setAbilityNotUsed",
//               reenter: true,
//             },
//           },
//         },
//       },
//     },
//   },
// });
