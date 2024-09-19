import * as fs from 'fs';
import * as path from 'path';
import { DeckConfigSchema } from './schema';
import { safeParse } from 'zod-error';
import { SafeParseError } from 'zod';

describe('DeckConfig Schema Validation', () => {
  const directoryPath = path.join(__dirname, './');

  // Read all JSON files from the directory
  const jsonFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith('.deck.json'));

  jsonFiles.forEach((file) => {
    it(`should have a valid deck config in ${file}`, () => {
      const filePath = path.join(directoryPath, file);
      const deckConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const result = safeParse(DeckConfigSchema, deckConfig);
      if (!result.success) {
        expect(
          (result as SafeParseError<typeof result> & { error: unknown }).error
            .message
        ).toBe('');
      }
    });
  });
});
