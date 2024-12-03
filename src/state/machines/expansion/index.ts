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
import { ExpansionActionFunctionMap } from "@/lib/types";

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
] as const;

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
];

export const expansionStageEventText = {
  policy_specialDraw: "You drew a special card!",
  policy_fundingIncrease: "You drew a funding card that can\ncontribute towards the implementation of a measure!",
  ...ClimateChange.stageEventText,
};

export type ExpansionPackStageEvent = "policy_specialDraw" | "policy_fundingIncrease" | "policy_climateChange";
