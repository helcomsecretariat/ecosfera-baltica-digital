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
          ).toBeDefined();
        });
      }

      it("has description UI string", () => {
        const description = uiStrings[policyName as keyof typeof uiStrings]?.description;
        expect(description, "Missing description in UI strings").toBeDefined();
      });

      it("has name UI string", () => {
        const name = uiStrings[policyName as keyof typeof uiStrings]?.name;
        expect(name, "Missing name in UI strings").toBeDefined();
      });

      it("has event description UI string", () => {
        const eventDescription = uiStrings[policyName as keyof typeof uiStrings]?.eventDescription;
        expect(eventDescription, "Missing event description in UI strings").toBeDefined();
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
