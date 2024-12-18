import { useControls } from "leva";

export const useAnimControls = () => {
  return useControls({
    animSpeed: {
      label: "Animation speed",
      value: 19,
      min: 1,
      step: 1,
      max: 40,
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
