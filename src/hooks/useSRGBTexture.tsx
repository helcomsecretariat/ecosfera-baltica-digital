import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, Texture } from "three";

export function useSRGBTexture(url: string): Texture;
export function useSRGBTexture(url: string[]): Texture[];
export function useSRGBTexture(url: string | string[]) {
  const texture = useTexture(url) as Texture | Texture[];
  if (Array.isArray(texture)) {
    texture.forEach((t) => (t.colorSpace = SRGBColorSpace));
  } else if (texture) {
    texture.colorSpace = SRGBColorSpace;
  }
  return texture;
}
