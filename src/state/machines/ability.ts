import { inspect } from "@/state/machines/utils";
import { AbilityName, AbilityTile, AnimalCard, Card, DisasterCard, ElementCard, PlantCard } from "@/state/types";
import { sendTo, setup, assign, ActorRef, Snapshot } from "xstate";

export type AbilityMachineOutEvents =
  | { type: "ability.markAsUsed" }
  | { type: "ability.draw.playerDeck" }
  | { type: "ability.refresh.animalDeck" }
  | { type: "ability.refresh.plantDeck" }
  | { type: "ability.move.toPlayer"; card: Card; destinationCard: Card }
  | { type: "ability.move.toAnimalDeck"; card: AnimalCard }
  | { type: "ability.move.toPlantDeck"; card: PlantCard }
  | { type: "ability.move.toElementDeck"; card: ElementCard; name: ElementCard["name"] };

export type AbilityMachineInEvents =
  | { type: "user.click.market.deck.animal" }
  | { type: "user.click.market.deck.plant" }
  | { type: "user.click.market.deck.element"; name: ElementCard["name"] }
  | { type: "user.click.player.hand.card"; card: DisasterCard | PlantCard | AnimalCard | ElementCard }
  | { type: "user.click.player.deck" }
  | { type: "user.click.token"; token: AbilityTile };

type TurnMachine = ActorRef<Snapshot<unknown>, AbilityMachineOutEvents>;

export const AbilityMachine = setup({
  types: {
    context: {} as {
      piece: AbilityTile | PlantCard | AnimalCard;
      name: AbilityName;
      cardToMove?: Card;
      parentActor: TurnMachine;
    },
    input: {} as {
      piece: AbilityTile | PlantCard | AnimalCard;
      name: AbilityName;
      parentActor: TurnMachine;
    },

    events: {} as AbilityMachineInEvents,
  },
  guards: {
    isRefreshAbility: ({ context: { name } }) => name === "refresh",
    isMoveAbility: ({ context: { name } }) => name === "move",
    isPlusAbility: ({ context: { name } }) => name === "plus",
    isSpecialAbility: ({ context: { name } }) => name === "special",
    notSameCard: ({ context: { piece } }, card: Card) => piece.uid !== card.uid,
    notSameToken: ({ context: { piece } }, token: AbilityTile) => piece.uid !== token.uid,
  },
  actions: {
    throwError: () => {
      throw new Error("Canceled");
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMBGBLANugLgTwGIAVAeQGkBRAOQH0BhAGQEk6yBtABgF1FQAHAPaxc6AQDteIAB6IALACYANCDyIAHAEYAdAGZ58gJwa1AdlkBWeScsmAvreVosuPFohgAxugjoxUApw8SCCCwjiiEsEyCGo6uvKyphyyAGxq+gYmyqoI8hwpWpoGmjomHOZqKQYp9o4Y2Phunt6+-mwaQfxCIuKS0Romalom1WpqCjqyshx5BtlyCYUa5ho6GuvyakZqtSBODa7uXj5+AfKdId3hvVGIA0MjaePyk9Oz8wjmJgWxqSmTphM8g0sl2+xcTWOrQCOguoR6kVA-TSw1Gz1eMw4cxUiHkVS0sgG1RMk3+eRSdgce3qEL4mAArrACAAFBgAQQAmhQAEo0AAiFFY9GYrECknh10R0juywKAz0LwMHA0ZLUH3MK0KXws6xVVgpYJpjQATmAAGam2AACy0fHQHgA1kRkMaYDgCGyqEwALJshj8wVkYUsdjccVXCJ9RA6GaFPGxQY6CoZLI4hApFKyLRVeTmWQ6CmpJM7Kngk3my02u2O52usDu1meogBoWMENi4ISyO3BAx+RxtKlWLJwypnLWAxaYlWZ4aYEJQ3ORoAWwEADcwLb7U6XW6CHQ2dy+cHRWHOxGbkjEClylpVmoZpUBuZquYPvnJ7JrJsUusv0mv0XA4tFXDct0dPk4HCMRkElfdD2PNtTzhC8pX6WU7xJfQdCVFU9DVNMPwJb8nxBEk80pKkxAEdx4GCMsci6MJuyvBAAFoDDiFZZEyNIOA4EwNGSWQPjY8wpwMSTMkGF4nhWICIQ8ZAxA8MBMHDZjL2lXtzDiDQjEJKZLCVAwrA+ZZJ0sDhxjUcwM2KEYSzqJdDnEMANIRKMEHvApkgMOyVU4ooRLTNJtDMfj-jKPyQQUxojhaPwPMlLyFHVf4tDyNYFE2fMbx0OLXDpRlkpY7SdFsu9cOMNZMnGdUzGGcx+LyJ81mBQqtFgPhmmQdTz00tDo1MqcY2Kf5pm2D48RMXQdHmhJBMkv9OtNC04CtUqtOiNiLC0bjeIfAShKmD4ZKq-yUmwmNLFWisNvAnc6xwLahtyAlbJmWrTK2DUSQ+Iw4ls-SMgEl9rM60D3IGzye1KLM8mMPNTESfyVQ+GNZvSQx9N4wkSUh9dN2rJ63Ve1L9Ey5VbMSMxfvRwjpiptY1iE-4jpqUsjVcKHHsg2BoNgsqu229RGtsh9KgMBQFE498may5Z5UzZZKnsewgA */
  inspect,
  context: ({ input: { piece, name, parentActor } }) => ({ piece, name, parentActor }),
  id: "ability",
  initial: "deciding",

  on: {
    "user.click.token": {
      target: "#ability.cancel",
      guard: {
        type: "notSameToken",
        params: ({ event: { token } }) => token,
      },
    },
  },

  states: {
    cancel: {
      type: "final",
      entry: "throwError",
    },
    done: {
      type: "final",
      entry: sendTo(({ context: { parentActor } }) => parentActor, {
        type: "ability.markAsUsed",
      }),
    },
    deciding: {
      always: [
        { target: "#ability.refresh", guard: "isRefreshAbility" },
        { target: "#ability.move", guard: "isMoveAbility" },
        { target: "#ability.plus", guard: "isPlusAbility" },
        { target: "#ability.special", guard: "isSpecialAbility" },
      ],
    },

    plus: {
      on: {
        "user.click.player.deck": {
          target: "#ability.done",
          actions: sendTo(({ context: { parentActor } }) => parentActor, {
            type: "ability.draw.playerDeck",
          }),
        },
      },
    },
    special: {},
    refresh: {
      initial: "pickTarget",

      description: "refresh ability",
      states: {
        pickTarget: {
          on: {
            "user.click.market.deck.animal": {
              target: "#ability.done",
              actions: sendTo(({ context: { parentActor } }) => parentActor, {
                type: "ability.refresh.animalDeck",
              } as AbilityMachineOutEvents),
            },
            "user.click.market.deck.plant": {
              target: "#ability.done",
              actions: sendTo(({ context: { parentActor } }) => parentActor, {
                type: "ability.refresh.plantDeck",
              } as AbilityMachineOutEvents),
            },
          },
          description: "picking a deck to refresh",
        },
      },
    },
    move: {
      initial: "pickTarget",
      description: "move ability",
      states: {
        pickTarget: {
          description: "picking a card to move",
          on: {
            "user.click.player.hand.card": {
              target: "pickDestination",
              actions: assign({
                cardToMove: ({ event: { card } }) => card,
              }),
              guard: {
                type: "notSameCard",
                params: ({ event: { card } }) => card,
              },
            },
          },
        },
        pickDestination: {
          description: "picking a destination for the card",
          on: {
            "user.click.player.hand.card": {
              target: "#ability.done",
              actions: sendTo(
                ({ context: { parentActor } }) => parentActor,
                ({ context: { cardToMove }, event: { card } }) =>
                  ({
                    type: "ability.move.toPlayer",
                    card: cardToMove,
                    destinationCard: card,
                  }) as AbilityMachineOutEvents,
              ),
            },
            "user.click.market.deck.animal": {
              target: "#ability.done",
              actions: sendTo(
                ({ context: { parentActor } }) => parentActor,
                ({ context: { cardToMove } }) =>
                  ({ type: "ability.move.toAnimalDeck", card: cardToMove }) as AbilityMachineOutEvents,
              ),
            },
            "user.click.market.deck.plant": {
              target: "#ability.done",
              actions: sendTo(
                ({ context: { parentActor } }) => parentActor,
                ({ context: { cardToMove } }) =>
                  ({ type: "ability.move.toPlantDeck", card: cardToMove }) as AbilityMachineOutEvents,
              ),
            },
            "user.click.market.deck.element": {
              target: "#ability.done",
              actions: sendTo(
                ({ context: { parentActor } }) => parentActor,
                ({ context: { cardToMove }, event: { name } }) =>
                  ({
                    type: "ability.move.toElementDeck",
                    card: cardToMove,
                    name,
                  }) as AbilityMachineOutEvents,
              ),
            },
          },
        },
      },
    },
  },
});
