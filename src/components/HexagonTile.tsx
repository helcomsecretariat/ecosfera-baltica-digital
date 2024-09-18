import { DragControls } from "@react-three/drei";

const HexagonTile = ({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) => {
  return (
    <DragControls>
      <mesh position={[x, y, 0]} rotation={[1.57, 0, 0]}>
        <cylinderGeometry args={[5, 5, 0.1, 6, 1]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </DragControls>
  );
};

export default HexagonTile;
