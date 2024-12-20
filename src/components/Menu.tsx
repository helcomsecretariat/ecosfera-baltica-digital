import { FaFish, FaHouse, FaTree, FaXmark } from "react-icons/fa6";
import { MdHexagon } from "react-icons/md";
import { GiCardPickup } from "react-icons/gi";
import { useGameState } from "@/context/game-state/hook";
import clsx from "clsx";
import { useSelector } from "@xstate/react";
import {
  selectNumberOfAnimalsBought,
  selectNumberOfHabitatsUnlocked,
  selectNumberOfPlantsBought,
} from "@/state/machines/selectors";

const Menu = () => {
  const { emit, guards, state, showPolicies, setShowPolicies, gameConfig, actorRef, test } = useGameState();
  const numberOfAnimalsBought = useSelector(actorRef, selectNumberOfAnimalsBought);
  const numberOfPlantsBought = useSelector(actorRef, selectNumberOfPlantsBought);
  const numberOfHabitatsUnlocked = useSelector(actorRef, selectNumberOfHabitatsUnlocked);

  return (
    <div className="absolute top-0 z-[1] flex h-14 w-screen justify-between self-start">
      <button
        className="bg-blue-500 pl-6 pr-8 text-white transition-all hover:pl-8 hover:pr-10"
        style={{
          clipPath: "polygon(0% 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%)",
          WebkitClipPath: "polygon(0% 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%)",
          backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif",
          backgroundPosition: "25% 50%",
          backgroundSize: "240%",
        }}
        onClick={() => window.location.reload()}
      >
        <FaHouse className="h-6 w-6" />
      </button>
      <div className="flex">
        {gameConfig.useSpecialCards &&
          state.commandBar &&
          !guards.isPolicyCancellationBlocked() &&
          guards.isActivePolicyCardPositive() && <CancelButton onClick={emit.cancelPolicyCard()} />}
        {state.commandBar && test.cancelAbility() && <CancelButton onClick={emit.cancelAbility()} />}
        {state.commandBar && (
          <div
            className="-mr-8 flex items-center bg-[#0087BE] pl-10 pr-10 text-white transition-all"
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
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 20px 100%)",
              WebkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 20px 100%)",
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
            <span>{numberOfPlantsBought}</span>
          </div>
          <div className="flex items-center space-x-2 text-xl">
            <FaFish className="h-6 w-6 text-orange-500" />
            <span>{numberOfAnimalsBought}</span>
          </div>
          <div className="flex items-center space-x-2 text-xl">
            <MdHexagon className="h-6 w-6 text-blue-500" />
            <span>
              {numberOfHabitatsUnlocked}
              /6
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;

const CancelButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className="-mr-8 flex items-center bg-red-500 pl-8 pr-10 text-white transition-all hover:bg-red-700"
      style={{
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 20px 100%)",
        WebkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 20px 100%)",
      }}
      onClick={onClick}
    >
      <FaXmark />
    </button>
  );
};
