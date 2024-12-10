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
import { ExpansionActionFunctionMap } from "@/lib/types";
import i18n from "@/i18n";

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
];

export const expansionCardsEndTurnActions = [...UnderwaterNoise.endTurnActions];

export const expansionStageEventText = {
  policy_specialDraw: i18n.t("deck.policies.specialDraw"),
  policy_fundingIncrease: i18n.t("deck.policies.fundingIncrease"),
  ...ClimateChange.stageEventText,
};

export type ExpansionPackStageEvent = "policy_specialDraw" | "policy_fundingIncrease" | "policy_climateChange";

export type ExpansionPackPolicyCard = UnderwaterNoise.CardType;
