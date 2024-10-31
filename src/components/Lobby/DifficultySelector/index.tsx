import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const DifficultySelector = ({ onDifficultyChange }: { onDifficultyChange: (difficulty: number) => void }) => {
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [direction, setDirection] = useState<"backwards" | "forwards">("forwards");

  const handleDifficultyChange = (newDifficulty: number) => {
    if (newDifficulty < 1 || newDifficulty > 6) return;
    setDirection(newDifficulty > difficulty ? "forwards" : "backwards");
    setDifficulty(newDifficulty as 1 | 2 | 3 | 4 | 5 | 6);
    onDifficultyChange(difficulty);
  };

  const variants = {
    enter: (direction: "backwards" | "forwards") => {
      return { x: direction === "forwards" ? 100 : -100, opacity: 0 };
    },
    idle: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "backwards" | "forwards") => {
      return { x: direction === "forwards" ? -100 : 100, opacity: 0 };
    },
  };

  return (
    <div className="flex select-none items-center space-x-1 overflow-hidden">
      <button
        className={clsx("flex h-8 w-8 items-center justify-center", difficulty <= 1 ? "invisible" : "visible")}
        onClick={() => handleDifficultyChange(difficulty - 1)}
      >
        &lt;
      </button>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.span
          custom={direction}
          key={difficulty}
          variants={variants}
          initial="enter"
          animate="idle"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          Level {difficulty}
        </motion.span>
      </AnimatePresence>
      <button
        className={clsx("flex h-8 w-8 items-center justify-center", difficulty >= 6 ? "invisible" : "visible")}
        onClick={() => handleDifficultyChange(difficulty + 1)}
      >
        &gt;
      </button>
    </div>
  );
};

export default DifficultySelector;
