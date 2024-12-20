//coord scale to convert figma mockups
export const coordScale = 135 / 19;
export const cardHeight = 135 / coordScale;
export const cardWidth = 90 / coordScale;
export const cardRadius = 6 / coordScale;
export const policyCardWidth = cardHeight * 1.5;
export const policyCardHeight = cardWidth * 1.3;

export const CARD_Z_INDEX = {
  CARD_BASE: 0,
  HIGHLIGHT_BORDER: -0.2,
  HABITAT_BACKGROUND: 0.1,
  HABITAT_ICONS: 0.15,
  ABILITY_ICONS: 0.1,
  NAME_LABEL: 0.1,
  ELEMENTS_BACKGROUND: 0.1,
  ELEMENT_ICONS: 0.15,
  UID: 0.35,
  DIMMED_OVERLAY: 0.25,
};

export const cardDepth = Math.max(...Object.values(CARD_Z_INDEX));
