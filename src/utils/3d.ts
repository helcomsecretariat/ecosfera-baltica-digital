import { Coordinate } from "@/state/types";

export const toVector3 = (coordinate: Coordinate): [number, number, number] => {
  return [coordinate.x, coordinate.y, coordinate.z];
};
