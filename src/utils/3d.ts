import { Coordinate } from "@/state/types";
import { Matrix4, Quaternion, Vector3 } from "three";

export const decomposeMatrix = (matrix: Matrix4) => {
  const position = new Vector3();
  const rotation = new Quaternion();
  const scale = new Vector3();

  matrix.decompose(position, rotation, scale);

  return {
    position,
    rotation,
    scale,
  };
};

export const calculateDistance = (firstPosition: Coordinate, secondPosition: Coordinate) => {
  const dx = firstPosition.x - secondPosition.x;
  const dy = firstPosition.y - secondPosition.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const toVector3 = (coordinate: Coordinate): [number, number, number] => {
  return [coordinate.x, coordinate.y, coordinate.z];
};
