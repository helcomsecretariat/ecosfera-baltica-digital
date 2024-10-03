import { Card, CardType, GameState, AbilityTile } from "@/state/types";
import { EventFromLogic } from "xstate";
import GameStateMachine from "@/state/state-machine";

export interface StateHandlers {
  buyCard: (card: Card) => () => void;
  iddqd: (gameState: GameState) => () => void;
  drawPlayerCard: () => void;
  refreshMarket: (marketType: CardType) => () => void;
  useToken: (token: AbilityTile) => () => void;
  refreshToken: (token: AbilityTile) => () => void;
}

export const createStateHandlers = (send: (e: EventFromLogic<typeof GameStateMachine>) => void): StateHandlers => {
  const sendEvent =
    <T extends EventFromLogic<typeof GameStateMachine>["data"]>(
      type: EventFromLogic<typeof GameStateMachine>["type"],
      data: T,
    ) =>
    () => {
      send({ type, data } as EventFromLogic<typeof GameStateMachine>);
    };

  return {
    buyCard: (card: Card) => sendEvent("BUY_MARKET_CARD", { card }),
    iddqd: (gameState: GameState) => sendEvent("IDDQD", gameState),
    drawPlayerCard: () => sendEvent("DRAW_PLAYER_CARD", {}),
    refreshMarket: (market_type: CardType) => sendEvent("REFRESH_MARKET_DECK", { market_type }),
    useToken: (token: AbilityTile) => sendEvent("USE_TOKEN", { token }),
    refreshToken: (token: AbilityTile) => sendEvent("REFRESH_TOKEN", { token }),
  };
};
