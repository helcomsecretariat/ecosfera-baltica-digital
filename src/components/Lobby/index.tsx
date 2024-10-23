import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRandomName, generateRandomString } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { InfoIcon } from "@/components/ui/icons";
import { GameConfig } from "@/state/types";

interface LobbyScreenProps {
  onStartGame: (settings: GameConfig) => void;
}

const LobbyScreen = ({ onStartGame }: LobbyScreenProps) => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlSeed = searchParams.get("seed") ?? generateRandomString(8);

  const [playerCount, setplayerCount] = useState<number>(3);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(""));
  const [difficulty, setDifficulty] = useState<number>(1);
  const [seed, setSeed] = useState<string>(urlSeed);

  const existingNames = new Set<string>();

  useEffect(() => {
    // Generate unique player names when the number of players changes.
    const newPlayerNames = Array.from(
      { length: playerCount },
      (_, index) => playerNames[index] || generateRandomName(existingNames),
    );
    setPlayerNames(newPlayerNames);
  }, [playerCount]);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const handleStartGame = () => {
    const selectedNames = playerNames.slice(0, playerCount).map((name, index) => name || `Player ${index + 1}`);
    onStartGame({
      playerCount: playerCount,
      playerNames: selectedNames,
      difficulty: difficulty as 1 | 2 | 3 | 4 | 5 | 6,
      seed,
      playersPosition: "around",
      useSpecialCards: false,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <section className="w-1/2 flex-col items-center justify-center rounded-lg bg-slate-300 p-2">
        <h1 className="mb-8 text-4xl font-bold">EcoSfera Baltica Game</h1>

        {/* Number of Players */}
        <div className="mb-6 w-full">
          <label className="mb-2 block text-lg">Number of Players</label>
          <ToggleGroup
            type="single"
            value={playerCount.toString()}
            onValueChange={(value) => {
              if (value !== null) {
                setplayerCount(parseInt(value));
              }
            }}
            className="grid grid-cols-4 gap-2"
          >
            {[1, 2, 3, 4].map((num) => (
              <ToggleGroupItem key={num} value={num.toString()} className="flex-1">
                {num}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Player Names */}
        <div className="mb-6 w-full">
          <label className="mb-2 block text-lg">Player Names</label>
          {Array.from({ length: playerCount }, (_, index) => (
            <Input
              key={index}
              type="text"
              className="mb-2 w-full"
              placeholder={`Player ${index + 1} Name`}
              value={playerNames[index] || ""}
              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
            />
          ))}
        </div>

        {/* Advanced Options */}
        <div className="mb-6 w-full">
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced">
              <AccordionTrigger>Advanced Options </AccordionTrigger>
              <AccordionContent>
                {/* Game Difficulty */}
                <div className="mt-4">
                  <label className="mb-2 flex items-center text-lg">
                    Difficulty
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="ml-2 cursor-pointer rounded-md bg-white p-1 text-gray-500">
                          <InfoIcon />
                        </span>
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        sideOffset={5}
                        align="start"
                        className="max-w-xs rounded-md bg-white p-2 shadow-md"
                      >
                        <p>
                          Difficulty affects the total number of element cards that can be borrowed from the market
                          throughout the game, not just in a single turn.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </label>
                  <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(parseInt(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Game Seed */}
                <div className="mt-4">
                  <label className="mb-2 flex items-center text-lg">
                    Seed
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="ml-2 cursor-pointer rounded-md bg-white p-1 text-gray-500">
                          <InfoIcon />
                        </span>
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        sideOffset={5}
                        align="start"
                        className="max-w-xs rounded-md bg-white p-2 shadow-md"
                      >
                        <p>
                          The seed ensures a consistent game deck shuffle. Using the same seed will result in the same
                          deck order each time.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </label>
                  <Input type="text" className="w-full" value={seed} onChange={(e) => setSeed(e.target.value)} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        {/* Start Game Button */}
        <Button className="w-full" onClick={handleStartGame}>
          Start Game
        </Button>
      </section>
    </div>
  );
};

export default LobbyScreen;
