import Lobby from "@/components/Lobby";
import "./App.css";
import GameBoard from "./components/GameBoard";
import { useState } from "react";
import { GameConfig } from "@/state/types";
import { GameStateProvider } from "@/context/game-state/provider";
import { TimeMachine } from "@/components/TimeMachine";

const App = () => {
  const [gameSettings, setGameSettings] = useState<GameConfig | null>(null);

  if (!gameSettings) {
    return <Lobby onStartGame={setGameSettings} />;
  }

  return (
    <GameStateProvider {...gameSettings}>
      <TimeMachine />
      <GameBoard />
    </GameStateProvider>
  );
};

export default App;
