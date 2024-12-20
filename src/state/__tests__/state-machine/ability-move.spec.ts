import { test, expect } from "vitest";
import { getTestActor } from "@/state/__tests__/utils";
import { without } from "lodash";
import i18n from "@/i18n";

test("moving to other player", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();
  const moveToken = stateBefore.players[0].abilities.find(({ name }) => name === "move")!;
  const cardToMove = stateBefore.players[0].hand[0];
  const targetPlayerCard = stateBefore.players[1].hand[0];

  send({ type: "user.click.token", token: moveToken });
  let state = getState();
  expect(state.turn.currentAbility?.piece.uid).toBe(moveToken.uid);
  expect(state.turn.currentAbility?.name).toBe("move");
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickCard"));

  send({ type: "user.click.player.hand.card", card: cardToMove });
  state = getState();
  expect(state.turn.currentAbility?.targetCard?.uid).toBe(cardToMove.uid);
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickDestination"));

  send({ type: "user.click.player.hand.card", card: targetPlayerCard });
  state = getState();
  expect(state.players[1].hand).toContain(cardToMove);
  expect(state.players[0].hand).not.toContain(cardToMove);
  expect(state.players[0].abilities.find(({ uid }) => uid === moveToken.uid)!.isUsed).toBe(true);
});

test("moving back to market", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();
  const moveToken = stateBefore.players[0].abilities.find(({ name }) => name === "move")!;
  const elementCard = stateBefore.players[0].hand.find((card) => card.type === "element")!;

  send({ type: "user.click.token", token: moveToken });
  let state = getState();
  expect(state.turn.currentAbility?.piece.uid).toBe(moveToken.uid);
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickCard"));

  send({ type: "user.click.player.hand.card", card: elementCard });
  state = getState();
  expect(state.turn.currentAbility?.targetCard?.uid).toBe(elementCard.uid);
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickDestination"));

  send({ type: "user.click.market.deck.element", name: elementCard.name });
  state = getState();
  expect(state.elementMarket.deck).toContain(elementCard);
  expect(state.players[0].hand).not.toContain(elementCard);
  expect(state.players[0].abilities.find(({ uid }) => uid === moveToken.uid)!.isUsed).toBe(true);
});

test("disaster can't be returned to market in multiplayer", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();
  const moveToken = stateBefore.players[0].abilities.find(({ name }) => name === "move")!;

  const disasterCard = stateBefore.disasterMarket.deck[0];
  send({
    type: "iddqd",
    context: {
      disasterMarket: {
        ...stateBefore.disasterMarket,
        deck: without(stateBefore.disasterMarket.deck, disasterCard),
      },
      players: [
        {
          ...stateBefore.players[0],
          hand: [...stateBefore.players[0].hand, disasterCard],
        },
        ...stateBefore.players.slice(1),
      ],
    },
  });

  send({ type: "user.click.token", token: moveToken });
  send({ type: "user.click.player.deck" });
  let state = getState();
  expect(state.turn.currentAbility?.piece.uid).toBe(moveToken.uid);

  send({ type: "user.click.player.hand.card", card: disasterCard });
  state = getState();
  expect(state.players[0].hand).toContain(disasterCard);
  expect(state.players[0].abilities.find(({ uid }) => uid === moveToken.uid)!.isUsed).toBe(false);
});

test("move card to supply in single player", async () => {
  const { send, getState } = getTestActor();
  const stateBefore = getState();

  send({
    type: "iddqd",
    context: {
      players: [stateBefore.players[0]],
      config: {
        ...stateBefore.config,
        playerCount: 1,
      },
    },
  });

  let state = getState();
  const moveToken = state.players[0].abilities.find(({ name }) => name === "move")!;
  const cardToMove = state.players[0].hand[0];

  send({ type: "user.click.token", token: moveToken });
  state = getState();
  expect(state.turn.currentAbility?.piece.uid).toBe(moveToken.uid);
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickCard"));

  send({ type: "user.click.player.hand.card", card: cardToMove });
  state = getState();
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickDestinationSinglePlayer"));

  send({ type: "user.click.player.deck" });
  state = getState();
  expect(state.players[0].deck[0]).toBe(cardToMove);
  expect(state.players[0].hand).not.toContain(cardToMove);
  expect(state.players[0].abilities.find(({ uid }) => uid === moveToken.uid)!.isUsed).toBe(true);
});

test("moving to other player's hand", async () => {
  const { send, getState, can } = getTestActor();
  const stateBefore = getState();
  const moveToken = stateBefore.players[0].abilities.find(({ name }) => name === "move")!;
  const cardToMove = stateBefore.players[0].hand[0];
  const targetPlayer = stateBefore.players[1];

  send({ type: "user.click.token", token: moveToken });
  let state = getState();
  expect(state.turn.currentAbility?.piece.uid).toBe(moveToken.uid);
  expect(state.turn.currentAbility?.name).toBe("move");
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickCard"));

  send({ type: "user.click.player.hand.card", card: cardToMove });
  expect(can({ type: "user.click.player.deck" })).toBe(false);
  state = getState();
  expect(state.turn.currentAbility?.targetCard?.uid).toBe(cardToMove.uid);
  expect(state.commandBar?.text).toBe(i18n.t("abilities.commandBar.move.pickDestination"));

  const targetPlayerCard = targetPlayer.hand[0];
  send({ type: "user.click.player.hand.card", card: targetPlayerCard });
  state = getState();

  expect(state.players[1].hand).toContain(cardToMove);
  expect(state.players[0].hand).not.toContain(cardToMove);
  expect(state.players[0].abilities.find(({ uid }) => uid === moveToken.uid)!.isUsed).toBe(true);
});
