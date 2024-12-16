import { Text } from "@react-three/drei";
import { useRelevantMaterial } from "@/components/MaterialProvider/hook";
import { ComponentProps } from "react";

type TextWithShadowProps = ComponentProps<typeof Text>;

const TextWithShadow = ({
  children,
  strokeColor = "#000000",
  outlineColor = "#ffffff",
  outlineOpacity = 1,
  strokeWidth = 0.5,
  outlineBlur = "10%",
  font,
  fontStyle = "normal",
  depthOffset = -100,
  ...props
}: TextWithShadowProps) => {
  const { getRelevantMaterial } = useRelevantMaterial();
  const defaultFont =
    fontStyle === "italic" ? "/fonts/josefin-sans-v32-latin-italic.ttf" : "/fonts/josefin-sans-v32-latin-regular.ttf";

  const fontPath = font || defaultFont;

  return (
    <Text
      {...{
        ...props,
        strokeWidth,
        strokeColor,
        depthOffset,
        outlineBlur,
        outlineColor,
        outlineOpacity,
      }}
      material={getRelevantMaterial({ toneMapped: false })}
      font={fontPath}
    >
      {children}
    </Text>
  );
};

export default TextWithShadow;
