import Lobby from "@/components/Lobby";
import "./App.css";
import GameBoard from "./components/GameBoard";
import { Suspense, useState } from "react";
import { GameConfig } from "@/state/types";
import { GameStateProvider } from "@/context/game-state/provider";
import { TimeMachine } from "@/components/TimeMachine";
import { useDebugMode } from "@/hooks/useDebugMode";
import { useAssetPreloader } from "@/hooks/useAssetPreloader";
import LoadingScreen from "@/components/LoadingScreen";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { DeckConfig } from "@/decks/schema";

const App = () => {
  const [gameSettings, setGameSettings] = useState<GameConfig | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const isDebugging = useDebugMode();
  const { progress, done } = useAssetPreloader((deckConfig as unknown as DeckConfig).assets_prefix);

  const handleStartGame = (settings: GameConfig) => {
    setSceneReady(false);
    setGameSettings(settings);
  };

  if (!gameSettings) {
    return <Lobby onStartGame={handleStartGame} />;
  }

  if (!done) {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <>
      <Suspense fallback={<LoadingScreen progress={1} />}>
        <GameStateProvider {...gameSettings}>
          {isDebugging && <TimeMachine />}
          <GameBoard onSceneReady={() => setSceneReady(true)} />
        </GameStateProvider>
      </Suspense>
      {/* keep the loading screen up until the 3D scene has actually mounted (textures decoded, shaders compiled) */}
      {!sceneReady && <LoadingScreen progress={1} overlay />}
    </>
  );
};

export default App;
