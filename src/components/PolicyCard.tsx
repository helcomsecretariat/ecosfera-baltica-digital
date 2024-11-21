import { cardHeight, cardWidth, policyCardHeight, policyCardWidth } from "@/constants/card";
import { PolicyCard as PolicyCardType } from "@/state/types";
import GameElement from "./GameElement";
import { RoundedRectangleGeometry } from "./shapes/roundedRect";
import { useRelevantMaterial } from "./MaterialProvider/hook";
import { Text } from "@react-three/drei";

const PolicyCard = ({
  card,
  onClick,
  isExhausted = false,
}: {
  card: PolicyCardType;
  onClick?: () => void;
  isExhausted?: boolean;
}) => {
  const effectColor = {
    positive: "#87d495",
    negative: "#d487d0",
    dual: "#d4c787",
    implementation: "#87bad4",
  };
  const { RelevantMaterial } = useRelevantMaterial();

  return (
    <GameElement
      width={cardWidth}
      height={cardHeight}
      onClick={onClick}
      key={card.uid}
      cardUID={card.uid}
      // withFloatAnimation={withFloatAnimation}
    >
      <mesh position={[0, 0, -0.1]}>
        <RoundedRectangleGeometry args={[policyCardWidth, policyCardHeight, 1.5, 0.02]} />
        <RelevantMaterial attach="material-0" color="lightgreen" />
        <RelevantMaterial attach="material-1" />
      </mesh>
      <mesh>
        <RoundedRectangleGeometry args={[policyCardWidth, policyCardHeight, 1.5, 0.05]} />
        <RelevantMaterial attach="material-0" color={isExhausted ? "#888" : effectColor[card.effect]} />
        <RelevantMaterial attach="material-1" />
      </mesh>
      <Text position={[0, 5, 1]} color="black" fontSize={1.5} maxWidth={15} textAlign="center" overflowWrap="normal">
        {card.name}
      </Text>
      <Text position={[0, -2, 1]} color="black" fontSize={1} overflowWrap="break-word" maxWidth={13} textAlign="center">
        {card.description}
      </Text>
    </GameElement>
  );
};

export default PolicyCard;
