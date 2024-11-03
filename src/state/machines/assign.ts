/* eslint-disable */
// @ts-nocheck
// to hacky to fix linting/typechecking

import { toUiState } from "@/state/ui/positioner";

import {
  ActionArgs,
  ActionFunction,
  AnyActorScope,
  AnyMachineSnapshot,
  assign as xstateAssign,
  Assigner,
  EventObject,
  MachineContext,
  ParameterizedObject,
  PropertyAssigner,
  ProvidedActor,
} from "xstate";

export function assign<
  TContext extends MachineContext,
  TExpressionEvent extends EventObject,
  TParams extends ParameterizedObject["params"] | undefined,
  TEvent extends EventObject,
  TActor extends ProvidedActor,
>(
  assignment:
    | Assigner<TContext, TExpressionEvent, TParams, TEvent, TActor>
    | PropertyAssigner<TContext, TExpressionEvent, TParams, TEvent, TActor>,
): ActionFunction<TContext, TExpressionEvent, TEvent, TParams, TActor, any, any, any, any> {
  const assignAction = xstateAssign(assignment);

  const originalResolve = assignAction.resolve;

  assignAction.resolve = function customResolve(
    actorScope: AnyActorScope,
    snapshot: AnyMachineSnapshot,
    actionArgs: ActionArgs<TContext, TExpressionEvent, TEvent>,
    actionParams: TParams,
    { assignment }: { assignment: typeof assignment },
  ) {
    const result = originalResolve.call(assignAction, actorScope, snapshot, actionArgs, actionParams, { assignment });

    const [updatedSnapshot] = result;

    updatedSnapshot.context.ui = toUiState(updatedSnapshot.context.ui, updatedSnapshot.context);

    return [updatedSnapshot];
  };

  return assignAction;
}
