import { useControls } from "leva";
import { isDebugging } from "./useDebugMode";

export const ANIM_CONFIG = {
  initialValue: 19,
  min: 1,
  max: 40,
};

export const useAnimControls = () => {
  const debugControls = useControls(
    {
      animSpeed: {
        label: "Animation speed",
        value: 19,
        step: 1,
        ...ANIM_CONFIG,
      },
      ease: {
        options: [
          "linear",
          "easeIn",
          "easeOut",
          "easeInOut",
          "circIn",
          "circOut",
          "circInOut",
          "backIn",
          "backOut",
          "backInOut",
          "anticipate",
        ],
        value: "anticipate",
      },
    },
    { disabled: !isDebugging },
  );

  return {
    animSpeed: debugControls.animSpeed,
    ease: debugControls.ease,
  };
};
