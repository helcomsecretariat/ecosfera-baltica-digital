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

export const calculateDistance = (
  firstPosition: [number, number, number],
  secondPosition: [number, number, number],
) => {
  const dx = firstPosition[0] - secondPosition[0];
  const dy = firstPosition[1] - secondPosition[1];
  return Math.sqrt(dx * dx + dy * dy);
};
