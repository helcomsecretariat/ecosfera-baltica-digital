import clsx from "clsx";
import { useState } from "react";

const DifficultySelector = ({ onDifficultyChange }: { onDifficultyChange: (difficulty: number) => void }) => {
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const handleDifficultyChange = (newDifficulty: number) => {
    if (newDifficulty < 1 || newDifficulty > 6) return;
    setDifficulty(newDifficulty as 1 | 2 | 3 | 4 | 5 | 6);
    onDifficultyChange(difficulty);
  };

  return (
    <div className="flex select-none items-center space-x-1">
      <button
        className={clsx("flex h-8 w-8 items-center justify-center", difficulty <= 1 ? "invisible" : "visible")}
        onClick={() => handleDifficultyChange(difficulty - 1)}
      >
        &lt;
      </button>
      <span>Level {difficulty}</span>
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
