import React, { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import type { DeckConfig } from "@/decks/schema";
import { preloadFont } from "troika-three-text";

interface PreloadAssetsProps {
  config: DeckConfig;
}

const PreloadAssets: React.FC<PreloadAssetsProps> = ({ config }) => {
  const { assets_prefix } = config;

  useEffect(() => {
    const loadManifestAndPreload = async () => {
      try {
        // Preload fonts
        const fonts = ["/fonts/josefin-sans-v32-latin-regular.ttf", "/fonts/josefin-sans-v32-latin-italic.ttf"];

        const fontPromises = fonts.map(
          (font) =>
            new Promise((resolve) => {
              preloadFont(
                {
                  font,
                  characters:
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?-+/\\(){}[]<>%$#@&*=:;'\"",
                },
                () => resolve(void 0),
              );
            }),
        );

        // Preload textures
        const manifestResponse = await fetch(`/${assets_prefix}/manifest.json`);
        const manifest = (await manifestResponse.json()) as string[];

        manifest.forEach((filename) => {
          const fullPath = `/${assets_prefix}/${filename}`;
          useTexture.preload(fullPath);
        });

        // Wait for fonts to finish loading
        await Promise.all(fontPromises);
      } catch (error) {
        console.error("Failed to load assets:", error);
        throw error;
      }
    };

    loadManifestAndPreload();
  }, [config, assets_prefix]);

  return null;
};

export default PreloadAssets;
