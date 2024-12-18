import { HabitatName } from "@/state/types";
import { Texture } from "three";
import { useSRGBTexture } from "./useSRGBTexture";
import { getAssetPath } from "@/components/utils";

const useHabitatIconTextures = (): { [K in HabitatName]: Texture } => {
  return {
    pelagic: useSRGBTexture(getAssetPath("habitat", "pelagic_icon")),
    ice: useSRGBTexture(getAssetPath("habitat", "ice_icon")),
    rivers: useSRGBTexture(getAssetPath("habitat", "rivers_icon")),
    coast: useSRGBTexture(getAssetPath("habitat", "coast_icon")),
    rock: useSRGBTexture(getAssetPath("habitat", "rock_icon")),
    mud: useSRGBTexture(getAssetPath("habitat", "mud_icon")),
  };
};

export default useHabitatIconTextures;
