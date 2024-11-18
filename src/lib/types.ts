import { TurnMachineContext, TurnMachineEvent } from "@/state/machines/turn";
import { ActionFunctionMap, ParameterizedObject, ProvidedActor, StateNodeConfig, TransitionConfig } from "xstate";

export type Tail<T extends unknown[]> = T extends [infer _, ...infer Tail] ? Tail : never;

export type ExpansionConditionConfig<
  ActionParams extends ParameterizedObject,
  GuardParams extends ParameterizedObject,
> = TransitionConfig<TurnMachineContext, TurnMachineEvent, TurnMachineEvent, never, ActionParams, GuardParams, never>;

export type ExpansionStateNodeConfig<
  ActionParams extends ParameterizedObject,
  GuardParams extends ParameterizedObject,
> = StateNodeConfig<
  TurnMachineContext,
  TurnMachineEvent,
  never,
  ActionParams,
  GuardParams,
  "animationDuration",
  string,
  never,
  never,
  never
>;

export type ToParameterizedObject<T> = {
  [K in keyof T]: T[K] extends (...args: [never, infer SecondParam, ...infer _]) => void
    ? { type: K; params: SecondParam }
    : { type: K };
}[keyof T];

export type ExpansionActionFunctionMap = ActionFunctionMap<
  TurnMachineContext,
  TurnMachineEvent,
  ProvidedActor,
  never,
  never
>;
