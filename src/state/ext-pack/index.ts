import {
  CARD_NAME as substance_regulation_CARD_NAME,
  guards as substance_regulation_guards,
  actions as substance_regulation_actions,
  stateMachine as substance_regulation_stateMachine,
  type State as substance_regulation_State,
} from "./substance_regulation";

export type ExtCardName = typeof substance_regulation_CARD_NAME;

export type ExtPackState = {
  [substance_regulation_CARD_NAME]: substance_regulation_State;
};

export const extPackActions = prefixKeys(substance_regulation_actions, substance_regulation_CARD_NAME);
export const extPackGuards = prefixKeys(substance_regulation_guards, substance_regulation_CARD_NAME);
export const extPackMainMachine = {
  [substance_regulation_CARD_NAME]: substance_regulation_stateMachine,
};

function prefixKeys<T extends Record<string, any>>(
  obj: T,
  prefix: ExtCardName,
): { [K in keyof T as `${typeof prefix}_${K & string}`]: T[K] } {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      (acc as any)[`${prefix}_${key}`] = value;
      return acc;
    },
    {} as { [K in keyof T as `${typeof prefix}_${K & string}`]: T[K] },
  );
}
