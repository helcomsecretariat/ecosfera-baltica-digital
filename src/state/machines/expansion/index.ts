import * as HazardousSubstanceRegulation from "./hazardous_substance_regulation";
import * as WasteWaterTreatmentFailure from "./waste_water_treatment_failure";
import * as WarmSummer from "./warm_summer";
import * as ClimateChange from "./climate_change";
import { ExpansionActionFunctionMap } from "@/lib/types";

export const expansionActions = {
  ...HazardousSubstanceRegulation.actions,
  ...WasteWaterTreatmentFailure.actions,
  ...WarmSummer.actions,
  ...ClimateChange.actions,
} as ExpansionActionFunctionMap;

export const expansionState = {
  ...HazardousSubstanceRegulation.state,
  ...WasteWaterTreatmentFailure.state,
  ...WarmSummer.state,
  ...ClimateChange.state,
};

export const expansionConditionChecks = [
  HazardousSubstanceRegulation.conditionCheck,
  WasteWaterTreatmentFailure.conditionCheck,
  WarmSummer.conditionCheck,
];

export const expansionStageEventText = {
  policy_specialDraw: "You drew a special card!",
  policy_fundingIncrease: "You drew a funding card that can\ncontribute towards the implementation of a measure!",
  ...ClimateChange.stageEventText,
};

export type ExpansionPackStageEvent = "policy_specialDraw" | "policy_fundingIncrease" | "policy_climateChange";
