import fs from "fs-extra";
import path from "path";
import { globSync } from "glob";
import { describe, expect, test } from "vitest";

describe("Public Folder Size Tests", () => {
  const decksDir = path.resolve(__dirname, "src", "decks");
  const publicDir = path.resolve(__dirname, "public");

  const jsonFiles = globSync(`${decksDir}/*.deck.json`);

  jsonFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(content);
    const assetsPrefix = jsonData.assets_prefix;
    const folderPath = path.join(publicDir, assetsPrefix);
    const manifestPath = path.join(folderPath, "manifest.json");

    test(`Check if ${manifestPath} exists`, () => {
      expect(fs.existsSync(manifestPath)).toBe(true);
    });

    test(`Folder '${folderPath}' size is less than 10MB as they it's fully preloaded in the app`, () => {
      if (!assetsPrefix) {
        throw new Error(`Missing 'assets_prefix' in file ${filePath}`);
      }

      if (!fs.existsSync(folderPath)) {
        throw new Error(`Directory does not exist: ${folderPath}`);
      }

      const folderSize = getDirectorySize(folderPath);
      const maxSize = 10 * 1024 * 1024; // 10 MB in bytes

      expect(folderSize).toBeLessThan(maxSize);
    });
  });
});

// Recursively calculate the directory size
function getDirectorySize(dirPath: string): number {
  return fs.readdirSync(dirPath).reduce((total, item) => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    return total + (stat.isDirectory() ? getDirectorySize(itemPath) : stat.size);
  }, 0);
}
