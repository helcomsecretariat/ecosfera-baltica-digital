import { HabitatName } from "@/state/types";
import { Texture } from "three";
import { useSRGBTexture } from "./useSRGBTexture";
import { getAssetPath } from "@/components/utils";

const useHabitatIconTextures = (): { [K in HabitatName]: Texture } => {
  return {
    pelagic: useSRGBTexture(getAssetPath("tile", "pelagic_icon")),
    ice: useSRGBTexture(getAssetPath("tile", "ice_icon")),
    rivers: useSRGBTexture(getAssetPath("tile", "rivers_icon")),
    coast: useSRGBTexture(getAssetPath("tile", "coast_icon")),
    rock: useSRGBTexture(getAssetPath("tile", "rock_icon")),
    mud: useSRGBTexture(getAssetPath("tile", "mud_icon")),
    baltic: useSRGBTexture(getAssetPath("tile", "baltic_active")),
  };
};

export default useHabitatIconTextures;
