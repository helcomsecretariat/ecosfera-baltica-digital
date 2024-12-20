# Localization Guide

This document describes how to manage and update localizations in the project.

## Overview

The project uses [i18next](https://www.i18next.com/) for internationalization with the following key components:

- Translation files in JSON format (`src/locales/<language>/translation.json`)
- TypeScript type definitions generated from translations
- Automated tests to ensure consistency across languages

For detailed i18next features and concepts, see the [i18next documentation](https://www.i18next.com/overview/getting-started).

## Directory Structure

```
src/
├── locales/
│   ├── en/
│   │   └── translation.json    # English translations
│   ├── fi/
│   │   └── translation.json    # Finnish translations
│   └── locales.spec.ts         # Tests for translation consistency
├── @types/
│   ├── i18next.d.ts           # i18next type augmentation
│   └── locale.d.ts            # Generated type definitions
```

## Adding/Updating Translations

1. **Update Translation Files**

   - Add or modify translations in `src/locales/<language>/translation.json`
   - Ensure all languages have the same keys (CI tests will do that too)
   - Follow the existing nested structure

2. **Generate Type Definitions**

   ```bash
   npm run update-locale-typings
   ```

   This command updates the TypeScript definitions in `src/@types/locale.d.ts`

3. **Verify Consistency**
   ```bash
   npm test
   ```
   This runs automated tests to ensure:
   - All languages have the same keys
   - No missing translations
   - No extra keys in any language

## Adding a New Language

1. Create a new directory under `src/locales/` with the language code

   ```bash
   mkdir src/locales/<language_code>
   ```

2. Copy the English translation file as a template

   ```bash
   cp src/locales/en/translation.json src/locales/<language_code>/translation.json
   ```

3. Update the new translation file with translated content

4. Run tests to verify consistency
   ```bash
   npm test
   ```

For language codes (fi/en/en-US/...), refer to the [i18next language codes documentation](https://www.i18next.com/overview/configuration-options#languages-namespaces-resources).

## Type Safety

The project uses [i18next-resources-for-ts](https://github.com/i18next/i18next-resources-for-ts) to maintain type safety through:

- Generated TypeScript definitions (`locale.d.ts`)
- i18next type augmentation (`i18next.d.ts`)

For more details on TypeScript integration, see the [i18next TypeScript documentation](https://www.i18next.com/overview/typescript).

## Best Practices

1. **Key Structure**

   - Use nested objects for logical grouping
   - Keep keys descriptive and consistent
   - Use camelCase for key names

   See [i18next naming conventions](https://www.i18next.com/translation-function/essentials#overview-options)

2. **Pluralization**

   - Use `_one` and `_other` suffixes for plural forms as per [i18next pluralization](https://www.i18next.com/translation-function/plurals)
   - Example:
     ```json
     {
       "earnedHabitat_one": "You earned the {{habitatText}} habitat",
       "earnedHabitat_other": "You earned the {{habitatText}} habitats"
     }
     ```

3. **Variables**

   - Use double curly braces for variables: `{{variableName}}`
   - Keep variable names consistent across translations

   See [i18next interpolation docs](https://www.i18next.com/translation-function/interpolation)

4. **Testing**
   - Always run tests after updating translations
   - Fix any consistency issues before committing changes
