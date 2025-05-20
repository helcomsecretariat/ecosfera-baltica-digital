import { cardHeight, cardWidth } from "@/constants/card";
import { PolicyCard as PolicyCardType } from "@/state/types";
import { Html } from "@react-three/drei";
import GameElement from "../GameElement";
import clsx from "clsx";
import { Button } from "../ui/button";
import { uiStrings } from "@/state/machines/expansion";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { InfoIcon } from "../ui/icons";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <h1 className="font-bold">{t(uiStrings[cardName].name)}</h1>
            <Popover>
              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                <span className="ml-2 cursor-pointer rounded-full bg-white p-1 text-black">
                  <InfoIcon className="h-[14px] w-[14px]" />
                </span>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                sideOffset={20}
                alignOffset={-16}
                align="end"
                className="w-72 max-w-xs rounded-md bg-white p-2 text-xs text-black shadow-md"
              >
                <p>{t(uiStrings[cardName].eventDescription)}</p>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-xs font-light">{t(uiStrings[cardName].description)}</p>
          {!isActive && allowActivation && (
            <div className="flex w-full items-center justify-between space-x-2">
              <Button className="flex-1" onClick={onClick}>
                {t("policies.activate")}
              </Button>
            </div>
          )}
        </div>
      </Html>
    </GameElement>
  );
};

export default PolicyCard;
