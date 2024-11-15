import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useGameState } from "@/context/game-state/hook";
import { useControls, button } from "leva";
import { SnapshotFrom } from "xstate";
import { TurnMachine } from "@/state/machines/turn";

const MAX_HISTORY_LENGTH = 40;
const LOCAL_STORAGE_KEY_PREFIX = "ecoSferaStates_";

export const TimeMachine = () => {
  const { emit, actorRef, snap: lowResSnap } = useGameState();
  const snap = useMemo(() => actorRef.getPersistedSnapshot() as SnapshotFrom<typeof TurnMachine>, [lowResSnap]);
  const currentIndex = useRef(0);
  const gameStateHistory = useRef([snap]);
  const [options, setOptions] = useState<{ [key: string]: number }>({
    [flatten(snap.value)]: 0,
  });
  const [persistedOptions, setPersistedOptions] = useState<{ [key: string]: string }>({});

  const updatePersistedOptions = useCallback(() => {
    const options: { [key: string]: string } = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCAL_STORAGE_KEY_PREFIX)) {
        const stateName = key.substring(LOCAL_STORAGE_KEY_PREFIX.length);
        options[stateName] = key;
      }
    }

    setPersistedOptions(options);
  }, []);

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

      ["Save state"]: button(() => {
        const stateName = prompt("Enter name for current state");
        if (stateName) {
          const key = LOCAL_STORAGE_KEY_PREFIX + stateName + ` (${snap.context.players.length} players)`;
          try {
            const persistendSnap = actorRef.getPersistedSnapshot();
            localStorage.setItem(key, JSON.stringify(persistendSnap));
            updatePersistedOptions();
          } catch (error) {
            console.error(error);
            alert("Couldn't save state. Are you using private mode?");
          }
        }
      }),
    }),
    [options, persistedOptions],
  );

  const updateOptions = useCallback(() => {
    const updatedOptions = gameStateHistory.current.reduce(
      (acc, snap, index) => {
        const path = flatten(snap.value) + ` (${-index})`;
        acc[path] = index;
        return acc;
      },
      {} as { [key: string]: number },
    );

    if (JSON.stringify(options) !== JSON.stringify(updatedOptions)) {
      setOptions(updatedOptions);
      set({ selectedState: 0 });
    }
  }, [options, set]);

  useEffect(() => {
    updatePersistedOptions();
  }, [updatePersistedOptions, set]);

  useEffect(() => {
    if (snap !== gameStateHistory.current[currentIndex.current]) {
      gameStateHistory.current = [snap, ...gameStateHistory.current.slice(0, MAX_HISTORY_LENGTH)];
      currentIndex.current = 0;

      updateOptions();
    }
  }, [snap, updateOptions]);

  useEffect(() => {
    if (Number.isNaN(selectedState)) return;
    if (selectedState !== currentIndex.current && selectedState < gameStateHistory.current.length) {
      emit.iddqd(gameStateHistory.current[selectedState].context)();
      gameStateHistory.current = gameStateHistory.current.slice(selectedState + 1);
      currentIndex.current = 0;
      updateOptions();

      // Reset selectedState to prevent repeated runs
      set({ selectedState: 0 });
    }
  }, [selectedState, emit, updateOptions, set]);

  useEffect(() => {
    if (loadState && loadState !== "---") {
      const snapStr = localStorage.getItem(loadState);
      if (snapStr) {
        const loadedSnap = JSON.parse(snapStr);

        emit.iddqd(loadedSnap.context)();

        gameStateHistory.current = [loadedSnap];
        currentIndex.current = 0;
        updateOptions();
      }
      // Reset loadState to prevent repeated runs
      set({ loadState: "---" });
    }
  }, [loadState, emit, updateOptions, set]);

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
