import { GameConfig } from "@/state/types";
import { ActionEmmiters, ActionTesters } from "@/state/action-handlers";
import { ContextInjectedGuardMap } from "@/state/machines/guards";
import { TurnMachine } from "@/state/machines/turn";
import { GameState, UiState } from "@/state/types";
import { createContext } from "react";
import { ActorRefFrom, EventFromLogic, SnapshotFrom } from "xstate";

interface StateContextType {
  snap: SnapshotFrom<typeof TurnMachine>;
  actorRef: ActorRefFrom<typeof TurnMachine>;
  state: GameState;
  send: (e: EventFromLogic<typeof TurnMachine>) => void;
  emit: ActionEmmiters;
  test: ActionTesters;
  guards: ContextInjectedGuardMap;
  hasTag: (tag: string) => boolean;
  uiState: UiState;
  gameConfig: GameConfig;
  showPolicies: boolean;
  setShowPolicies: (show: boolean) => void;
}

export const stateContext = createContext<StateContextType | undefined>(undefined);
