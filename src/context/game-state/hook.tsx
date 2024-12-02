import { stateContext } from "@/context/game-state/context";
import { useContext } from "react";

export const useGameState = () => {
  const context = useContext(stateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};
