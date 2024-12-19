import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import GameElement from "../GameElement";
import { cardHeight, cardWidth } from "@/constants/card";
import { RoundedRectangleGeometry } from "../shapes/roundedRect";
import { CardOrTileUID } from "@/state/types";

const FundingCard = ({ cardUid }: { cardUid: CardOrTileUID }) => {
  const texture = useSRGBTexture("/ecosfera_baltica/card_back.avif");

  return (
    <>
      <GameElement cardUID={cardUid} height={cardHeight} width={cardWidth}>
        <mesh>
          <RoundedRectangleGeometry args={[cardWidth, cardHeight, 1.5, 0.05]} />
          <meshBasicMaterial attach="material-0" map={texture} />
          <meshBasicMaterial attach="material-1" />
          <meshBasicMaterial attach="material-2" />
        </mesh>
      </GameElement>
    </>
  );
};

export default FundingCard;
