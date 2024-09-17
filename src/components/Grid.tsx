import { Text } from "@react-three/drei";
import { lowerXBoundary, upperYBoundary } from "../constants/gameBoard";

const Grid = ({divisions}: {divisions: number}) => {
  return (
    <group>
      {[...Array(divisions + 1)].map((_, index) => {
        const x = lowerXBoundary + index * ((lowerXBoundary * -2) / divisions);
        return (
          <mesh key={index} position={[x, 0, 0]}>
            <boxGeometry args={[0.1, upperYBoundary * 2, 0]} />
            <Text position={[0,upperYBoundary + 5,0]} fontSize={2}>{x}</Text>
            <meshBasicMaterial color="green" />
          </mesh>
        );
      })}
      {[...Array(divisions + 1)].map((_, index) => {
        const y = upperYBoundary - index * ((upperYBoundary * 2) / divisions);
        return (
          <mesh key={index} position={[0, y, 0]}>
            <boxGeometry args={[lowerXBoundary * -2, 0.1, 0]} />
            <Text position={[lowerXBoundary-5,0,0]} fontSize={2}>{y}</Text>
            <meshBasicMaterial color="red" />
          </mesh>
        );
      })}
    </group>
  );
};

export default Grid;
