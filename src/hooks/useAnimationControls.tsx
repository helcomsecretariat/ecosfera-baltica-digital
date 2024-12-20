import { useControls } from "leva";

export const ANIM_CONFIG = {
  initialValue: 19,
  min: 1,
  max: 40,
};

export const useAnimControls = () => {
  return useControls({
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
  });
};
