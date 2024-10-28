import { useRef, useEffect, useState } from "react";
import { useGameState } from "@/context/GameStateProvider";
import { useControls } from "leva";
import { SnapshotFrom } from "xstate";
import { TurnMachine } from "@/state/machines/turn";

const MAX_HISTORY_LENGTH = 40;

export const TimeMachine = () => {
  const { emit, snap } = useGameState();
  const currentIndex = useRef(0);
  const gameStateHistory = useRef([snap]);
  const [options, setOptions] = useState<{ [key: string]: number }>({ [flatten(snap.value)]: 0 });

  // Update the history when state changes
  useEffect(() => {
    if (snap !== gameStateHistory.current[currentIndex.current]) {
      gameStateHistory.current = [snap, ...gameStateHistory.current.slice(0, MAX_HISTORY_LENGTH)];
      currentIndex.current = 0;

      updateOptions();
    }
  }, [snap]);

  const updateOptions = () => {
    const updatedOptions = gameStateHistory.current.reduce(
      (acc, snap, index) => {
        const path = flatten(snap.value) + ` (${-index})`;
        acc[path] = index;
        return acc;
      },
      {} as { [key: string]: number },
    );

    setOptions(updatedOptions);
    set({ selectedState: 0 });
  };

  const [{ selectedState }, set] = useControls(
    () => ({
      selectedState: {
        label: "History",
        value: 0,
        options,
      },
    }),
    [options],
  );

  useEffect(() => {
    if (Number.isNaN(selectedState)) return;
    if (selectedState !== currentIndex.current && selectedState < gameStateHistory.current.length) {
      emit.iddqd(gameStateHistory.current[selectedState].context)();
      gameStateHistory.current = gameStateHistory.current.slice(selectedState + 1);
      currentIndex.current = 0;
      updateOptions();
    }
  }, [selectedState]);

  return null;
};

function flatten(obj: SnapshotFrom<typeof TurnMachine>["value"], prefix: string = ""): string {
  if (typeof obj === "string") return `${prefix}.${obj}`;
  let result: string[] = [];

  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    const value = (obj as Record<string, unknown>)[key];

    if (typeof value === "object" && value !== null) {
      result = result.concat(flatten(value as typeof obj, newPrefix));
    } else {
      result.push(`${newPrefix}.${value}`);
    }
  }
  return result.join();
}
