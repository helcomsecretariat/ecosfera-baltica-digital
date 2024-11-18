import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRandomName, generateRandomString } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { InfoIcon } from "@/components/ui/icons";
import { GameConfig } from "@/state/types";
import { FaPen, FaPlus, FaTimes } from "react-icons/fa";
import DifficultySelector from "./DifficultySelector";
import ImageButton from "../ui/imageButton";
import { without } from "lodash";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";

interface LobbyScreenProps {
  onStartGame: (settings: GameConfig) => void;
}

const LobbyScreen = ({ onStartGame }: LobbyScreenProps) => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlSeed = searchParams.get("seed") ?? generateRandomString(8);

  const [playerCount, setplayerCount] = useState<number>(3);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(""));
  const [difficulty, setDifficulty] = useState<number>(1);
  const [useExpansionPack, setUseExpansionPack] = useState(false);
  const [seed, setSeed] = useState<string>(urlSeed);
  const nameInputRefs = useRef<HTMLInputElement[]>([]);
  const seedInputRef = useRef<HTMLInputElement>(null);

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
      useSpecialCards: useExpansionPack,
    });

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("seed", seed);
    window.history.pushState({}, "", currentUrl.toString());
  };

  const handleRemovePlayer = (index: number) => {
    setPlayerNames(without(playerNames, playerNames[index]));
    setplayerCount(playerCount - 1);
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif)" }}
    >
      <section className="mt-auto flex w-full flex-col items-center justify-center space-y-5 rounded-lg p-2 pb-12 text-base text-white backdrop-blur-[3px] sm:w-8/12 md:w-5/12 lg:text-xl xl:text-2xl md:portrait:w-8/12 md:portrait:text-xl lg:portrait:text-3xl">
        {/* Number of Players */}
        <div className="relative flex w-full flex-col gap-1">
          <AnimatePresence mode="popLayout">
            {[...Array(playerCount).keys()].map((key) => (
              <motion.div
                key={key}
                className="flex items-center justify-between"
                initial={{ y: -300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -300, opacity: 0 }}
              >
                <label htmlFor={`playerName_${key}`}>Player {key + 1}</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    id={`playerName_${key}`}
                    className="w-auto rounded-none border-0 border-transparent border-white bg-transparent text-end text-inherit focus-visible:border-b-[1px] focus-visible:ring-0 focus-visible:ring-offset-0"
                    ref={(ref) => (nameInputRefs.current[key] = ref!)}
                    value={playerNames[key]}
                    onChange={(e) => handlePlayerNameChange(key, e.target.value)}
                  />
                  <Button size="icon" variant="tertiary" onClick={() => nameInputRefs.current[key].focus()}>
                    <FaPen />
                  </Button>
                  {playerCount > 1 && (
                    <Button size="icon" variant="secondary" onClick={() => handleRemovePlayer(key)}>
                      <FaTimes />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {playerCount < 4 && (
          <div className="flex items-center space-x-3">
            <Button size="icon" variant="secondary" onClick={() => setplayerCount(playerCount + 1)}>
              <FaPlus />
            </Button>
            <span
              className="cursor-pointer text-xl transition-all group-hover:opacity-85"
              onClick={() => setplayerCount(playerCount + 1)}
            >
              Add player
            </span>
          </div>
        )}
        {/* Game Difficulty */}
        <div className="flex w-full justify-between">
          <span>Difficulty</span>
          <div className="flex items-center justify-between space-x-6">
            <DifficultySelector onDifficultyChange={(difficulty: number) => setDifficulty(difficulty)} />
            <Popover>
              <PopoverTrigger asChild>
                <span className="ml-2 cursor-pointer rounded-full bg-white p-1 text-xl text-black">
                  <InfoIcon />
                </span>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                sideOffset={10}
                align="start"
                className="max-w-xs rounded-md bg-white p-2 text-base text-black shadow-md"
              >
                <p>
                  Difficulty affects the total number of element cards that can be borrowed from the market throughout
                  the game, not just in a single turn.{" "}
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {/* Advanced Options */}
        <Accordion type="single" collapsible className="!mt-0 w-full">
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced Options </AccordionTrigger>
            <AccordionContent>
              <div className="mt-4 flex items-center space-x-3">
                <Checkbox
                  id="expansionPack"
                  className="rounded-[4px] border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                  value={+useExpansionPack}
                  onClick={(_) => setUseExpansionPack(!useExpansionPack)}
                />
                <label htmlFor="expansionPack" className="flex items-center">
                  Use expansion pack
                </label>
              </div>
              <div className="mt-4 flex justify-between">
                <label htmlFor="seed" className="mb-2 flex items-center">
                  Seed
                </label>
                <div className="flex items-center">
                  <Input
                    id="seed"
                    type="text"
                    ref={seedInputRef}
                    className="w-auto rounded-none border-0 border-transparent border-white bg-transparent text-end focus-visible:border-b-[1px] focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                  <Button
                    size="icon"
                    variant="tertiary"
                    onClick={() => {
                      seedInputRef?.current?.focus();
                      seedInputRef?.current?.select();
                    }}
                  >
                    <FaPen />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="ml-2 cursor-pointer rounded-full bg-white p-1 text-xl text-black">
                        <InfoIcon />
                      </span>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      sideOffset={10}
                      align="start"
                      className="max-w-xs rounded-md bg-white p-2 text-base text-black shadow-md"
                    >
                      <p>
                        The seed ensures a consistent game deck shuffle. Using the same seed will result in the same
                        deck order each time.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* Start Game Button */}
        <div className="flex w-full justify-center pt-12">
          <ImageButton onClick={handleStartGame}>Play!</ImageButton>
        </div>
      </section>
    </div>
  );
};

export default LobbyScreen;
