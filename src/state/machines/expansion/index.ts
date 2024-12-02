import * as HazardousSubstanceRegulation from "./hazardous_substance_regulation";
import * as WasteWaterTreatmentFailure from "./waste_water_treatment_failure";
import * as WarmSummer from "./warm_summer";
import * as ClimateChange from "./climate_change";
import * as OilSpill from "./oil_spill";
import * as Funding from "./funding.ts";
import { ExpansionActionFunctionMap } from "@/lib/types";

export const names = [
  OilSpill.cardName,
  ClimateChange.cardName,
  WarmSummer.cardName,
  WasteWaterTreatmentFailure.cardName,
  HazardousSubstanceRegulation.cardName,
  Funding.cardName,
] as const;

export const uiStrings = {
  ...OilSpill.uiStrings,
  ...ClimateChange.uiStrings,
  ...WarmSummer.uiStrings,
  ...WasteWaterTreatmentFailure.uiStrings,
  ...HazardousSubstanceRegulation.uiStrings,
  ...Funding.uiStrings,
};

export const expansionActions = {
  ...HazardousSubstanceRegulation.actions,
  ...WasteWaterTreatmentFailure.actions,
  ...WarmSummer.actions,
  ...ClimateChange.actions,
  ...OilSpill.actions,
} as ExpansionActionFunctionMap;

export const expansionState = {
  ...HazardousSubstanceRegulation.state,
  ...WasteWaterTreatmentFailure.state,
  ...WarmSummer.state,
  ...ClimateChange.state,
  ...OilSpill.state,
};

export const expansionConditionChecks = [
  HazardousSubstanceRegulation.conditionCheck,
  WasteWaterTreatmentFailure.conditionCheck,
  WarmSummer.conditionCheck,
  OilSpill.conditionCheck,
];

export const expansionStageEventText = {
  policy_specialDraw: "You drew a special card!",
  policy_fundingIncrease: "You drew a funding card that can\ncontribute towards the implementation of a measure!",
  ...ClimateChange.stageEventText,
};

export type ExpansionPackStageEvent = "policy_specialDraw" | "policy_fundingIncrease" | "policy_climateChange";
