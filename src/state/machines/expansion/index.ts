import * as HazardousSubstanceRegulation from "./hazardous_substance_regulation";
import * as WasteWaterTreatmentFailure from "./waste_water_treatment_failure";
import * as WarmSummer from "./warm_summer";
import * as ClimateChange from "./climate_change";
import * as OilSpill from "./oil_spill";
import * as Funding from "./funding";
import * as HazardousIndustrialSubstances from "./hazardous_industrial_substances";
import * as Overfishing from "./overfishing";
import * as Hunting from "./hunting";
import * as AtmosphericDeposition from "./atmospheric_deposition";
import * as HabitatRestoration from "./habitat_restoration";
import * as BubbleCurtains from "./bubble_curtains";
import * as NutrientUpwelling from "./nutrient_upwelling";
import * as ExcessiveFertilizerUse from "./excessive_fertilizer_use";
import * as UpgradedWasteWaterTreatment from "./upgraded_waste_water_treatment";
import * as ImprovedNutrientRetention from "./improved_nutrient_retention";
import * as MigratoryBarrierRemoval from "./migratory_barrier_removal";
import * as FishingGearRegulation from "./fishing_gear_regulation";
import * as RecyclingAndWasteDisposal from "./recycling_and_waste_disposal";
import * as GreenEnergy from "./green_energy";
import * as UnderwaterNoise from "./underwater_noise";
import * as BeachLitter from "./beach_litter";
import * as StrictProtection from "./strict_protection";
import * as Shared from "./shared";
import { ExpansionActionFunctionMap } from "@/lib/types";
import { PolicyEffect } from "@/state/types";
import { TranslationKey } from "@/i18n";

export const names = [
  OilSpill.cardName,
  ClimateChange.cardName,
  WarmSummer.cardName,
  WasteWaterTreatmentFailure.cardName,
  HazardousSubstanceRegulation.cardName,
  Funding.cardName,
  HazardousIndustrialSubstances.cardName,
  Overfishing.cardName,
  Hunting.cardName,
  AtmosphericDeposition.cardName,
  HabitatRestoration.cardName,
  BubbleCurtains.cardName,
  NutrientUpwelling.cardName,
  ExcessiveFertilizerUse.cardName,
  UpgradedWasteWaterTreatment.cardName,
  ImprovedNutrientRetention.cardName,
  MigratoryBarrierRemoval.cardName,
  FishingGearRegulation.cardName,
  RecyclingAndWasteDisposal.cardName,
  GreenEnergy.cardName,
  UnderwaterNoise.cardName,
  BeachLitter.cardName,
  StrictProtection.cardName,
] as const;

export type PolicyCardName = (typeof names)[number];

export const uiStrings = {
  ...OilSpill.uiStrings,
  ...ClimateChange.uiStrings,
  ...WarmSummer.uiStrings,
  ...WasteWaterTreatmentFailure.uiStrings,
  ...HazardousSubstanceRegulation.uiStrings,
  ...Funding.uiStrings,
  ...HazardousIndustrialSubstances.uiStrings,
  ...Overfishing.uiStrings,
  ...Hunting.uiStrings,
  ...AtmosphericDeposition.uiStrings,
  ...HabitatRestoration.uiStrings,
  ...BubbleCurtains.uiStrings,
  ...NutrientUpwelling.uiStrings,
  ...ExcessiveFertilizerUse.uiStrings,
  ...UpgradedWasteWaterTreatment.uiStrings,
  ...ImprovedNutrientRetention.uiStrings,
  ...MigratoryBarrierRemoval.uiStrings,
  ...FishingGearRegulation.uiStrings,
  ...RecyclingAndWasteDisposal.uiStrings,
  ...GreenEnergy.uiStrings,
  ...UnderwaterNoise.uiStrings,
  ...BeachLitter.uiStrings,
  ...StrictProtection.uiStrings,
};

export const expansionActions = {
  ...HazardousSubstanceRegulation.actions,
  ...WasteWaterTreatmentFailure.actions,
  ...WarmSummer.actions,
  ...ClimateChange.actions,
  ...OilSpill.actions,
  ...HazardousIndustrialSubstances.actions,
  ...Overfishing.actions,
  ...Hunting.actions,
  ...AtmosphericDeposition.actions,
  ...HabitatRestoration.actions,
  ...BubbleCurtains.actions,
  ...NutrientUpwelling.actions,
  ...ExcessiveFertilizerUse.actions,
  ...UpgradedWasteWaterTreatment.actions,
  ...ImprovedNutrientRetention.actions,
  ...MigratoryBarrierRemoval.actions,
  ...FishingGearRegulation.actions,
  ...RecyclingAndWasteDisposal.actions,
  ...GreenEnergy.actions,
  ...UnderwaterNoise.actions,
  ...BeachLitter.actions,
  ...StrictProtection.actions,
  ...Shared.actions,
} as ExpansionActionFunctionMap;

export const expansionState = {
  ...HazardousSubstanceRegulation.state,
  ...WasteWaterTreatmentFailure.state,
  ...WarmSummer.state,
  ...ClimateChange.state,
  ...OilSpill.state,
  ...HazardousIndustrialSubstances.state,
  ...Overfishing.state,
  ...Hunting.state,
  ...AtmosphericDeposition.state,
  ...HabitatRestoration.state,
  ...BubbleCurtains.state,
  ...NutrientUpwelling.state,
  ...ExcessiveFertilizerUse.state,
  ...UpgradedWasteWaterTreatment.state,
  ...ImprovedNutrientRetention.state,
  ...MigratoryBarrierRemoval.state,
  ...FishingGearRegulation.state,
  ...RecyclingAndWasteDisposal.state,
  ...GreenEnergy.state,
  ...UnderwaterNoise.state,
  ...BeachLitter.state,
  ...StrictProtection.state,
};

export const expansionConditionChecks = [
  HazardousSubstanceRegulation.conditionCheck,
  WasteWaterTreatmentFailure.conditionCheck,
  WarmSummer.conditionCheck,
  OilSpill.conditionCheck,
  HazardousIndustrialSubstances.conditionCheck,
  Overfishing.conditionCheck,
  Hunting.conditionCheck,
  AtmosphericDeposition.conditionCheck,
  HabitatRestoration.conditionCheck,
  BubbleCurtains.conditionCheck,
  NutrientUpwelling.conditionCheck,
  ExcessiveFertilizerUse.conditionCheck,
  UpgradedWasteWaterTreatment.conditionCheck,
  ImprovedNutrientRetention.conditionCheck,
  MigratoryBarrierRemoval.conditionCheck,
  FishingGearRegulation.conditionCheck,
  RecyclingAndWasteDisposal.conditionCheck,
  GreenEnergy.conditionCheck,
  UnderwaterNoise.conditionCheck,
  BeachLitter.conditionCheck,
];

export const expansionCardsEndTurnActions = [...UnderwaterNoise.endTurnActions, ...BeachLitter.endTurnActions];

const msg: Record<string, Record<string, TranslationKey>> = {
  base: {
    implementation: "deck.policies.drawMessage.implementation",
    negative: "deck.policies.drawMessage.negative",
    dual: "deck.policies.drawMessage.dual",
    positive: "deck.policies.drawMessage.positive",
  },
  automaticDraw: {
    habitat: "deck.policies.drawMessage.automaticDraw.habitat",
    extinction: "deck.policies.drawMessage.automaticDraw.extinction",
  },
  positiveExtra: {
    hasFunding: "deck.policies.drawMessage.positiveExtra.hasFunding",
    noFunding: "deck.policies.drawMessage.positiveExtra.noFunding",
  },
};

type PolicyDrawStageEvent =
  | `policy_policyDraw${Capitalize<Exclude<PolicyEffect, "positive">>}`
  | `policy_policyAutoDrawHabitat${Capitalize<Exclude<PolicyEffect, "positive">>}`
  | `policy_policyAutoDrawExtinction${Capitalize<Exclude<PolicyEffect, "positive">>}`
  | "policy_policyDrawPositiveHasFunding"
  | "policy_policyDrawPositiveNoFunding"
  | "policy_policyAutoDrawHabitatPositiveHasFunding"
  | "policy_policyAutoDrawHabitatPositiveNoFunding"
  | "policy_policyAutoDrawExtinctionPositiveHasFunding"
  | "policy_policyAutoDrawExtinctionPositiveNoFunding";
export type ExpansionPackStageEvent = PolicyDrawStageEvent | ClimateChange.StageEvent | StrictProtection.StageEvent;

export const expansionStageEventTextKeys: Record<ExpansionPackStageEvent, TranslationKey | TranslationKey[]> = {
  // Basic policy draws
  policy_policyDrawImplementation: msg.base.implementation,
  policy_policyDrawNegative: msg.base.negative,
  policy_policyDrawDual: msg.base.dual,

  // Habitat automatic draws
  policy_policyAutoDrawHabitatImplementation: [msg.base.implementation, msg.automaticDraw.habitat],
  policy_policyAutoDrawHabitatNegative: [msg.base.negative, msg.automaticDraw.habitat],
  policy_policyAutoDrawHabitatDual: [msg.base.dual, msg.automaticDraw.habitat],

  // Extinction automatic draws
  policy_policyAutoDrawExtinctionImplementation: [msg.base.implementation, msg.automaticDraw.extinction],
  policy_policyAutoDrawExtinctionNegative: [msg.base.negative, msg.automaticDraw.extinction],
  policy_policyAutoDrawExtinctionDual: [msg.base.dual, msg.automaticDraw.extinction],

  // Positive draws with funding states
  policy_policyDrawPositiveHasFunding: [msg.base.positive, msg.positiveExtra.hasFunding],
  policy_policyDrawPositiveNoFunding: [msg.base.positive, msg.positiveExtra.noFunding],

  // Habitat positive draws with funding states
  policy_policyAutoDrawHabitatPositiveHasFunding: [
    msg.base.positive,
    msg.automaticDraw.habitat,
    msg.positiveExtra.hasFunding,
  ],
  policy_policyAutoDrawHabitatPositiveNoFunding: [
    msg.base.positive,
    msg.automaticDraw.habitat,
    msg.positiveExtra.noFunding,
  ],

  // Extinction positive draws with funding states
  policy_policyAutoDrawExtinctionPositiveHasFunding: [
    msg.base.positive,
    msg.automaticDraw.extinction,
    msg.positiveExtra.hasFunding,
  ],
  policy_policyAutoDrawExtinctionPositiveNoFunding: [
    msg.base.positive,
    msg.automaticDraw.extinction,
    msg.positiveExtra.noFunding,
  ],

  // Additional stage events from other modules
  ...ClimateChange.stageEventTextKeys,
  ...StrictProtection.stageEventTextKeys,
};

export type ExpansionPackPolicyCard = UnderwaterNoise.CardType | BeachLitter.CardType;
