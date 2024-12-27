import Lobby from "@/components/Lobby";
import "./App.css";
import GameBoard from "./components/GameBoard";
import { Suspense, useState } from "react";
import { GameConfig } from "@/state/types";
import { GameStateProvider } from "@/context/game-state/provider";
import { TimeMachine } from "@/components/TimeMachine";
import { useDebugMode } from "@/hooks/useDebugMode";

const App = () => {
  const [gameSettings, setGameSettings] = useState<GameConfig | null>(null);
  const isDebugging = useDebugMode();

  if (!gameSettings) {
    return <Lobby onStartGame={setGameSettings} />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameStateProvider {...gameSettings}>
        {isDebugging && <TimeMachine />}
        <GameBoard />
      </GameStateProvider>
    </Suspense>
  );
};

export default App;
