import Lobby from "@/components/Lobby";
import "./App.css";
import GameBoard from "./components/GameBoard";
import { useState } from "react";
import { GameConfig } from "@/state/types";

const App = () => {
  const [gameSettings, setGameSettings] = useState<GameConfig | null>(null);

  if (!gameSettings) {
    return <Lobby onStartGame={setGameSettings} />;
  }

  return <GameBoard {...gameSettings} />;
};

export default App;
