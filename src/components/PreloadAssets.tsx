import React, { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { getAssetPath } from "./utils";
import type { DeckConfig } from "@/decks/schema";
import { keys } from "lodash-es";

interface PreloadAssetsProps {
  config: DeckConfig;
}

const PreloadAssets: React.FC<PreloadAssetsProps> = ({ config }) => {
  const { assets_prefix } = config;
  const generateAssetPaths = (category: keyof DeckConfig) =>
    keys(config[category]).map((name) =>
      getAssetPath(category.replace(/ies$/, "y").replace(/s$/, ""), name, assets_prefix),
    );

  useEffect(() => {
    const assetPaths = [
      ...generateAssetPaths("plants"),
      ...generateAssetPaths("animals"),
      ...generateAssetPaths("disasters"),
      ...generateAssetPaths("elements"),
      ...generateAssetPaths("abilities"),
    ];

    assetPaths.forEach((path) => {
      useTexture.preload(path);
    });
    useTexture.preload(`/${assets_prefix}/circular_blur.webp`);
  }, [config]);

  return null;
};

export default PreloadAssets;
