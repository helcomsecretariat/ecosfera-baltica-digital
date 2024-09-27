import { Text } from "@react-three/drei";
import { ReactNode } from "react";

interface TextWithShadowProps {
  children: ReactNode;
  color?: string;
  shadowColor?: string;
  position: [number, number, number];
  [key: string]: unknown;
}

const TextWithShadow = ({
  children,
  color = "black",
  shadowColor = "lightgrey",
  position,
  ...props
}: TextWithShadowProps) => (
  <>
    <Text {...props} color={shadowColor} position={[position[0] + 0.08, position[1] - 0.08, position[2]]}>
      {children}
    </Text>
    <Text {...props} color={color} position={[position[0], position[1], position[2] + 0.05]}>
      {children}
    </Text>
  </>
);

export default TextWithShadow;
