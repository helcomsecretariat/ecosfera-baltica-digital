import { getAssetPath } from "@/components/utils";
import { useSRGBTexture } from "@/hooks/useSRGBTexture";
import { AbilityName } from "@/state/types";
import { Texture } from "three";

const useAbilityTextures = (): {
  fullSize: { [K in AbilityName]: Texture };
  zoomedIn: { [K in AbilityName]: Texture };
} => {
  const textures = {
    plus: useSRGBTexture(getAssetPath("ability", "plus")),
    refresh: useSRGBTexture(getAssetPath("ability", "refresh")),
    move: useSRGBTexture(getAssetPath("ability", "move")),
    special: useSRGBTexture(getAssetPath("ability", "special")),
  };

  const fullSize = {
    plus: textures.plus,
    refresh: textures.refresh,
    move: textures.move,
    special: textures.special,
  };

  const zoomedIn = {
    plus: textures.plus.clone(),
    refresh: textures.refresh.clone(),
    move: textures.move.clone(),
    special: textures.special.clone(),
  };

  Object.keys(zoomedIn).forEach((key) => {
    zoomedIn[key as AbilityName].repeat.set(0.9, 0.9);
    zoomedIn[key as AbilityName].center.set(0.5, 0.5);
  });

  return {
    fullSize,
    zoomedIn,
  };
};

export default useAbilityTextures;
