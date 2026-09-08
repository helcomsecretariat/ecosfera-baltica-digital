import { useEffect, useSyncExternalStore } from "react";
import { useTexture } from "@react-three/drei";
import { DefaultLoadingManager } from "three";
import { preloadFont } from "troika-three-text";

const FONTS = ["/fonts/josefin-sans-v32-latin-regular.ttf", "/fonts/josefin-sans-v32-latin-italic.ttf"];
const FONT_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?-+/\\(){}[]<>%$#@&*=:;'\"";

interface PreloadState {
  progress: number;
  done: boolean;
}

let state: PreloadState = { progress: 0, done: false };
const listeners = new Set<() => void>();
let started = false;

const setState = (next: PreloadState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Preloads every texture from the asset manifest plus the troika fonts, tracking
// per-item completion so the loading bar reflects actual load progress.
// Module-level singleton: safe under StrictMode's double-mounted effects.
const startPreload = (assetsPrefix: string) => {
  if (started) return;
  started = true;

  const prefix = `/${assetsPrefix}/`;
  const completedUrls = new Set<string>();
  let loadedCount = 0;
  let totalCount = Infinity;

  const originalOnProgress = DefaultLoadingManager.onProgress;
  const originalOnError = DefaultLoadingManager.onError;

  const restoreManager = () => {
    DefaultLoadingManager.onProgress = originalOnProgress;
    DefaultLoadingManager.onError = originalOnError;
  };

  const reportProgress = () => {
    if (loadedCount < totalCount) {
      setState({ progress: loadedCount / totalCount, done: false });
    } else {
      restoreManager();
      setState({ progress: 1, done: true });
    }
  };

  const trackUrl = (url: string) => {
    if (!url.startsWith(prefix) || completedUrls.has(url)) return;
    completedUrls.add(url);
    loadedCount += 1;
    reportProgress();
  };

  DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    originalOnProgress?.(url, itemsLoaded, itemsTotal);
    trackUrl(url);
  };
  DefaultLoadingManager.onError = (url) => {
    originalOnError?.(url);
    // count failures too, so a single broken asset can't stall the bar forever
    trackUrl(url);
  };

  const run = async () => {
    const manifestResponse = await fetch(`${prefix}manifest.json`);
    const manifest = (await manifestResponse.json()) as string[];
    const urls = [...new Set(manifest.map((filename) => `${prefix}${filename}`))];
    totalCount = urls.length + FONTS.length;

    urls.forEach((url) => useTexture.preload(url));
    FONTS.forEach((font) => {
      preloadFont({ font, characters: FONT_CHARACTERS }, () => {
        loadedCount += 1;
        reportProgress();
      });
    });
    reportProgress();
  };

  run().catch((error) => {
    console.error("Failed to preload assets:", error);
    restoreManager();
    // let the game's own suspense boundary pick up whatever is missing
    setState({ progress: 1, done: true });
  });
};

export const useAssetPreloader = (assetsPrefix: string): PreloadState => {
  useEffect(() => startPreload(assetsPrefix), [assetsPrefix]);
  return useSyncExternalStore(subscribe, () => state);
};
