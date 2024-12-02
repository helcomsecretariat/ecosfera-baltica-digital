import { cardHeight, cardWidth } from "@/constants/card";
import { PolicyCard as PolicyCardType } from "@/state/types";
import { Html } from "@react-three/drei";
import GameElement from "../GameElement";
import clsx from "clsx";
import { Button } from "../ui/button";
import { FaInfo } from "react-icons/fa6";
import { uiStrings } from "@/state/machines/expansion";

const PolicyCard = ({
  card,
  onClick,
  isActive,
  allowActivation = true,
  isOpaque = false,
}: {
  card: PolicyCardType;
  onClick?: () => void;
  isActive: boolean;
  allowActivation?: boolean;
  isOpaque?: boolean;
}) => {
  const cardName = card.name as keyof typeof uiStrings;

  return (
    <GameElement width={cardWidth} height={cardHeight} key={card.uid} cardUID={card.uid}>
      <Html transform scale={4}>
        <div
          className={clsx(
            "flex h-40 w-72 flex-col justify-between rounded-lg p-4 text-white",
            isActive
              ? isOpaque
                ? "h-40 bg-[#4f346e]"
                : "h-40 bg-[#4f346e]/50"
              : isOpaque
                ? "bg-[#4f346e]"
                : "h-56 bg-[#555]/50",
          )}
        >
          <h1 className="font-bold">{uiStrings[cardName].name}</h1>
          <p className="text-sm font-light">{uiStrings[cardName].description}</p>
          {!isActive && allowActivation && (
            <div className="flex w-full items-center justify-between space-x-2">
              <Button className="flex-1" onClick={onClick}>
                Activate
              </Button>
              <Button size="icon" variant="tertiary">
                <FaInfo />
              </Button>
            </div>
          )}
        </div>
      </Html>
    </GameElement>
  );
};

export default PolicyCard;
