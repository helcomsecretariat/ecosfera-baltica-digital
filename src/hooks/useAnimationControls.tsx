import { useControls } from "leva";

export const useAnimControls = () => {
  return useControls({
    animSpeed: {
      label: "Animation speed",
      value: 22,
      min: 1,
      step: 1,
      max: 100,
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
      value: "easeOut",
    },
  });
};
