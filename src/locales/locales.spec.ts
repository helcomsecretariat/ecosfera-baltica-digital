import { describe, test, expect } from "vitest";
import fs from "fs";
import path from "path";
import type Resources from "@/@types/locale";

// Detect available locales by reading directory names
const locales = fs
  .readdirSync(__dirname)
  .filter((file) => fs.statSync(path.join(__dirname, file)).isDirectory())
  .filter((dir) => fs.existsSync(path.join(__dirname, dir, "translation.json")));

console.log(__dirname);

const loadLocale = (locale: string): Resources["translation"] => {
  const filePath = path.resolve(__dirname, locale, "translation.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
};

describe("Translation keys consistency", () => {
  const localeData: Record<string, Resources["translation"]> = {};

  // Load all locale files
  locales.forEach((locale) => {
    localeData[locale] = loadLocale(locale);
  });

  // Get all keys from the first locale
  const allKeys = new Set(Object.keys(localeData[locales[0]]));

  locales.forEach((locale) => {
    test(`should have all keys in ${locale}`, () => {
      const missingKeys = Array.from(allKeys).filter(
        (key) => !Object.prototype.hasOwnProperty.call(localeData[locale], key),
      );
      expect(missingKeys).toHaveLength(0);
    });
  });

  // Check if there are any extra keys in each locale
  locales.forEach((locale) => {
    test(`should not have extra keys in ${locale}`, () => {
      const extraKeys = Object.keys(localeData[locale]).filter((key) => !allKeys.has(key));
      expect(extraKeys).toHaveLength(0);
    });
  });
});
