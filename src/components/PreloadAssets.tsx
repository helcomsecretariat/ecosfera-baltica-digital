import React, { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import type { DeckConfig } from "@/decks/schema";

interface PreloadAssetsProps {
  config: DeckConfig;
}

const PreloadAssets: React.FC<PreloadAssetsProps> = ({ config }) => {
  const { assets_prefix } = config;

  useEffect(() => {
    const loadManifestAndPreload = async () => {
      try {
        const manifestResponse = await fetch(`/${assets_prefix}/manifest.json`);
        const manifest = (await manifestResponse.json()) as string[];

        manifest.forEach((filename) => {
          const fullPath = `/${assets_prefix}/${filename}`;
          useTexture.preload(fullPath);
        });
      } catch (error) {
        console.error("Failed to load asset manifest:", error);
        throw error;
      }
    };

    loadManifestAndPreload();
  }, [config, assets_prefix]);

  return null;
};

export default PreloadAssets;
