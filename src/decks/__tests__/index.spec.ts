import { describe, expect, it } from "vitest";
import deckConfig from "@/decks/ecosfera-baltica.deck.json";
import { names as implementedPolicyNames, uiStrings } from "@/state/machines/expansion";

const configuredPolicyNames = Object.keys(deckConfig.policies);
const implementedNames = implementedPolicyNames.map((name) => name.toLowerCase());

describe("Policy Cards", () => {
  configuredPolicyNames.forEach((policyName) => {
    describe(`Policy "${policyName}"`, () => {
      if (!policyName.startsWith("Funding")) {
        it("has implementation", () => {
          expect(
            implementedNames.includes(policyName.toLowerCase()),
            `Policy "${policyName}" from config is not implemented`,
          ).toBe(true);
        });
      }

      it("has description UI string", () => {
        const description = uiStrings[policyName as keyof typeof uiStrings]?.description;
        expect(description && description !== "", "Missing description in UI strings").toBe(true);
      });

      it("has name UI string", () => {
        const name = uiStrings[policyName as keyof typeof uiStrings]?.name;
        expect(name && name !== "", "Missing name in UI strings").toBe(true);
      });
    });
  });

  // Test for implemented policies without config
  implementedNames.forEach((implName) => {
    it(`Implementation "${implName}" has matching policy in config`, () => {
      const exists = configuredPolicyNames.some((configName) => configName.toLowerCase() === implName);
      expect(exists).toBe(true);
    });
  });
});
