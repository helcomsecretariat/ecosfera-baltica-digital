import { Text } from "@react-three/drei";

const AbilityTile = ({
  x,
  y,
  name,
  available,
  onClick,
}: {
  x: number;
  y: number;
  name: string;
  available: boolean;
  onClick: () => void;
}) => {
  return (
    <mesh position={[x, y, 0]} onClick={onClick}>
      <circleGeometry args={[4, 32]} />
      <meshBasicMaterial color={available ? "white" : "gray"} />
      <Text color="black" fontSize={1.5}>
        {name}
      </Text>
    </mesh>
  );
};

export default AbilityTile;
