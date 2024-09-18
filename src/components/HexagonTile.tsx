import { DragControls, Text } from "@react-three/drei";
import { useState } from "react";

const HexagonTile = ({
  x,
  y,
  color,
  name = "",
}: {
  x: number;
  y: number;
  color: string;
  name?: string;
}) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <DragControls>
      <mesh
        scale={hovered ? 1.25 : 1}
        position={[x, y, 0]}
        rotation={[1.57, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <cylinderGeometry args={[5, 5, 0.1, 6, 1]} />
        <meshBasicMaterial color={color} />
        <Text color="white" fontSize={2}>
          Hello
        </Text>
      </mesh>
    </DragControls>
  );
};

export default HexagonTile;
