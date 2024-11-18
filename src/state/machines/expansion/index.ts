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
