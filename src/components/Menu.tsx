import { FaFish, FaHouse, FaTree } from "react-icons/fa6";
import { MdHexagon } from "react-icons/md";
import { GiCardPickup } from "react-icons/gi";
import { useGameState } from "@/context/game-state/hook";
import { filter } from "lodash";
import clsx from "clsx";

const Menu = () => {
  const { state, showPolicies, setShowPolicies, gameConfig } = useGameState();

  return (
    <div className="absolute top-0 z-[1] flex h-14 w-screen justify-between self-start">
      <button
        className="bg-blue-500 pl-6 pr-8 text-white transition-all hover:pl-8 hover:pr-10"
        style={{
          clipPath: "polygon(0% 0%, 100% 0%, 80% 100%, 0% 100%)",
          WebkitClipPath: "polygon(0% 0%, 100% 0%, 80% 100%, 0% 100%)",
          backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif",
          backgroundPosition: "25% 50%",
          backgroundSize: "240%",
        }}
        onClick={() => window.location.reload()}
      >
        <FaHouse className="h-6 w-6" />
      </button>
      <div className="flex">
        {gameConfig.useSpecialCards && state.commandBar && (
          <div
            className={clsx(
              "-mr-8 flex items-center bg-[#0087BE] pl-10 pr-10 text-white transition-all hover:bg-[#3070b8]",
              showPolicies ? "bg-[#3070b8] hover:bg-[#204B7B]" : "",
            )}
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 20px 100%)",
              WebkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 20px 100%)",
            }}
            onClick={() => setShowPolicies(!showPolicies)}
          >
            {state.commandBar.text}
          </div>
        )}
        {gameConfig.useSpecialCards && (
          <button
            className={clsx(
              "-mr-6 bg-[#204B7B] pl-10 pr-8 text-white transition-all hover:bg-[#3070b8]",
              showPolicies ? "bg-[#3070b8] hover:bg-[#204B7B]" : "",
            )}
            style={{
              clipPath: "polygon(0% 0%, 70% 0%, 100% 100%, 30% 100%)",
              WebkitClipPath: "polygon(0% 0%, 70% 0%, 100% 100%, 30% 100%)",
            }}
            onClick={() => setShowPolicies(!showPolicies)}
          >
            <GiCardPickup className="h-6 w-6" />
          </button>
        )}
        <div
          className="flex items-center justify-between space-x-3 bg-blue-500 pl-12 pr-8 text-white"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%)",
            WebkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%)",
            backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif",
            backgroundPosition: "60% 50%",
            backgroundSize: "240%",
          }}
        >
          <div className="flex items-center space-x-2 text-xl">
            <FaTree className="h-6 w-6 text-green-500" />
            <span>{state.statistics.plantsBought}</span>
          </div>
          <div className="flex items-center space-x-2 text-xl">
            <FaFish className="h-6 w-6 text-orange-500" />
            <span>{state.statistics.animalsBought}</span>
          </div>
          <div className="flex items-center space-x-2 text-xl">
            <MdHexagon className="h-6 w-6 text-blue-500" />
            <span>{filter(state.habitatMarket.deck, { isAcquired: true }).length}/6</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
