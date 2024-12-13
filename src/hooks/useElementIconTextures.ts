import { getAssetPath } from "@/components/utils";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { Texture } from "three";

export type ElementName = "sun" | "temperature" | "nutrients" | "salinity" | "oxygen";

const useElementIconTextures = (): {
  [K in ElementName]: Texture;
} => {
  const textures = {
    sun: useSRGBTexture(getAssetPath("element_icon", "sun")),
    temperature: useSRGBTexture(getAssetPath("element_icon", "temperature")),
    nutrients: useSRGBTexture(getAssetPath("element_icon", "nutrients")),
    salinity: useSRGBTexture(getAssetPath("element_icon", "salinity")),
    oxygen: useSRGBTexture(getAssetPath("element_icon", "oxygen")),
  };

  return {
    sun: textures.sun,
    temperature: textures.temperature,
    nutrients: textures.nutrients,
    salinity: textures.salinity,
    oxygen: textures.oxygen,
  };
};

export default useElementIconTextures;
