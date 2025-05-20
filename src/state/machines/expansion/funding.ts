import { TranslationKey } from "@/i18n";

export const cardName = "Funding";
export const uiStrings = {
  [cardName]: {
    name: "deck.policies.funding.name" as const,
    description: "deck.policies.funding.description" as const,
    eventDescription: "deck.policies.funding.eventDescription" as const,
  } as Record<string, TranslationKey>,
} as const;
