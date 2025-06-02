import { describe, test, expect } from "vitest";
import fs from "fs";
import path from "path";
import type Resources from "@/@types/locale";

// Helper function to get all nested keys from an object
const getAllNestedKeys = (obj: Record<string, unknown>, prefix = ""): string[] => {
  return Object.entries(obj).reduce((keys: string[], [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return [...keys, ...getAllNestedKeys(value as Record<string, unknown>, newKey)];
    }
    return [...keys, newKey];
  }, []);
};

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

  // Get all nested keys from the first locale
  const allKeys = new Set(getAllNestedKeys(localeData[locales[0]]));

  locales.forEach((locale) => {
    test(`should have all keys in ${locale}`, () => {
      const localeKeys = new Set(getAllNestedKeys(localeData[locale]));
      // const missingKeys = Array.from(allKeys).filter((key) => !localeKeys.has(key));
      expect(localeKeys, `Missing keys in ${locale} locale`).toEqual(allKeys);
    });
  });

  // Check if there are any extra keys in each locale
  locales.forEach((locale) => {
    test(`should not have extra keys in ${locale}`, () => {
      const localeKeys = new Set(getAllNestedKeys(localeData[locale]));
      const extraKeys = Array.from(localeKeys).filter((key) => !allKeys.has(key));

      expect(extraKeys, `Extra keys found in ${locale} locale`).toEqual([]);
    });
  });
});

describe("Rulebook file existence", () => {
  const rulebookDir = path.resolve(__dirname, "../../public/pdfs/rulebook");

  test("should have all referenced rulebook files", () => {
    locales.forEach((locale) => {
      const translation = loadLocale(locale);
      const rulebookFilename = translation.lobby.rulebook_filename;
      const filePath = path.join(rulebookDir, rulebookFilename);

      expect(
        fs.existsSync(filePath),
        `Rulebook file ${filePath} referenced in ${locale} translation does not exist`,
      ).toBe(true);
    });
  });
});
