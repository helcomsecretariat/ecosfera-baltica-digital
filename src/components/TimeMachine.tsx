import { useRef, useEffect, useState } from "react";
import { useGameState } from "@/context/GameStateProvider";
import { useControls, button } from "leva";
import { SnapshotFrom } from "xstate";
import { TurnMachine } from "@/state/machines/turn";

const MAX_HISTORY_LENGTH = 40;
const LOCAL_STORAGE_KEY_PREFIX = "ecoSferaStates_";

export const TimeMachine = () => {
  const { emit, snap } = useGameState();
  const currentIndex = useRef(0);
  const gameStateHistory = useRef([snap]);
  const [options, setOptions] = useState<{ [key: string]: number }>({
    [flatten(snap.value)]: 0,
  });
  const [persistedOptions, setPersistedOptions] = useState<{ [key: string]: string }>({});

  // Function to update the options for the persisted states select
  const updatePersistedOptions = () => {
    const options: { [key: string]: string } = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCAL_STORAGE_KEY_PREFIX)) {
        const stateName = key.substring(LOCAL_STORAGE_KEY_PREFIX.length);
        options[stateName] = key;
      }
    }

    setPersistedOptions(options);
  };

  useEffect(() => {
    updatePersistedOptions();
  }, []);

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

  const [{ selectedState, loadState }, set] = useControls(
    "Time travel",
    () => ({
      selectedState: {
        label: "History",
        value: 0,
        options,
      },

      loadState: {
        label: "Saved",
        value: "---",
        options: {
          ["---"]: "---",
          ...persistedOptions,
        },
      },

      saveState: button(() => {
        const stateName = prompt("Enter name for current state");
        if (stateName) {
          const key = LOCAL_STORAGE_KEY_PREFIX + stateName;
          try {
            localStorage.setItem(key, JSON.stringify(snap));
            updatePersistedOptions();
          } catch (error) {
            console.error(error);
            alert("Couldnt save state. Are you using private mode?");
          }
        }
      }),
    }),
    [options, persistedOptions],
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

  useEffect(() => {
    if (loadState) {
      const snapStr = localStorage.getItem(loadState);
      if (snapStr) {
        const loadedSnap = JSON.parse(snapStr);

        emit.iddqd(loadedSnap.context)();

        gameStateHistory.current = [loadedSnap];
        currentIndex.current = 0;
        updateOptions();
      }
    }
  }, [loadState]);

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
