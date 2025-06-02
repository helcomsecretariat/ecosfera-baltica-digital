import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRandomName, generateRandomString } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { InfoIcon } from "@/components/ui/icons";
import { GameConfig } from "@/state/types";
import { FaExternalLinkAlt, FaPen, FaPlus, FaTimes } from "react-icons/fa";
import DifficultySelector from "./DifficultySelector";
import ImageButton from "../ui/imageButton";
import { without } from "lodash";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LobbyScreenProps {
  onStartGame: (settings: GameConfig) => void;
}

const LobbyScreen = ({ onStartGame }: LobbyScreenProps) => {
  const { t, i18n, ready } = useTranslation();
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

  const [isChangingLang, setIsChangingLang] = useState(false);

  const handleLanguageChange = useCallback(
    async (langCode: string) => {
      try {
        setIsChangingLang(true);
        await i18n.changeLanguage(langCode);
      } catch (error) {
        console.error("Failed to change language:", error);
      } finally {
        setIsChangingLang(false);
      }
    },
    [i18n],
  );

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

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fi", name: "Suomi", flag: "🇫🇮" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "sv", name: "Svenska", flag: "🇸🇪" },
    { code: "da", name: "Dansk", flag: "🇩🇰" },
    { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
    { code: "et", name: "Eesti", flag: "🇪🇪" },
  ];

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif)" }}
    >
      <section className="mt-auto flex w-full flex-col items-center justify-center space-y-5 rounded-lg p-2 pb-12 text-base text-white backdrop-blur-[3px] sm:w-8/12 md:w-5/12 lg:text-xl xl:text-2xl md:portrait:w-8/12 md:portrait:text-xl lg:portrait:text-3xl">
        {/* Language Selector */}
        <div className="flex w-full justify-between">
          <span>{t("lobby.language")}</span>
          <Select
            value={i18n.language.split("-")[0]}
            onValueChange={handleLanguageChange}
            disabled={isChangingLang || !ready}
          >
            <SelectTrigger className="w-[180px] bg-white text-black">
              <SelectValue placeholder={t("lobby.language")} />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    {lang.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                <label htmlFor={`playerName_${key}`}>{t("lobby.player", { number: key + 1 })}</label>
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
              {t("lobby.addPlayer")}
            </span>
          </div>
        )}
        {/* Game Difficulty */}
        <div className="flex w-full justify-between">
          <span>{t("lobby.difficulty")}</span>
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
                <p>{t("lobby.difficultyInfo")}</p>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Rulebook Link */}
        <div className="flex w-full">
          <a
            href={`/pdfs/rulebook/${t("lobby.rulebook_filename")}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline transition-colors hover:text-gray-300"
          >
            {t("lobby.rulebook")} <FaExternalLinkAlt className="ml-1 inline-block text-sm" />
          </a>
        </div>

        {/* Advanced Options */}
        <Accordion type="single" collapsible className="!mt-0 w-full">
          <AccordionItem value="advanced">
            <AccordionTrigger>{t("lobby.advancedOptions")}</AccordionTrigger>
            <AccordionContent>
              <div className="mt-4 flex items-center space-x-3">
                <Checkbox
                  id="expansionPack"
                  className="rounded-[4px] border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                  value={+useExpansionPack}
                  onClick={() => setUseExpansionPack(!useExpansionPack)}
                />
                <label htmlFor="expansionPack" className="flex items-center">
                  {t("lobby.useExpansionPack")}
                </label>
              </div>
              <div className="mt-4 flex justify-between">
                <label htmlFor="seed" className="mb-2 flex items-center">
                  {t("lobby.seed")}
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
                      <p>{t("lobby.seedInfo")}</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Start Game Button */}
        <div className="flex w-full justify-center pt-12">
          <ImageButton onClick={handleStartGame}>{t("buttons.play")}</ImageButton>
        </div>
      </section>
    </div>
  );
};

export default LobbyScreen;
