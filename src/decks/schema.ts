import { z, ZodRawShape } from "zod";
import { keys, chain, assign } from "lodash";

const DeckItemConfigSchema = z.object({
  count: z.number().optional(),
});

const abilityNameSchema = z.enum(["move", "plus", "refresh", "special"]);
const floraTypeSchema = z.enum([
  "bacteria",
  "benthic microalgae",
  "brown algae",
  "ciliate",
  "cyanobacteria",
  "diatom",
  "dinoflagellate",
  "green algae",
  "phytoplankton",
  "picocyanobacteria",
  "red algae",
  "vascular plant",
  "viruses",
]);
const faunaTypeSchema = z.enum(["zooplankton", "birds", "fish/elasmobranch", "mammals", "zoobenthos"]);

function deckItemConfig<T extends ZodRawShape>(shape = {} as T) {
  return z.object(shape).merge(DeckItemConfigSchema);
}

const ElementConfigSchema = deckItemConfig();
const AbilityConfigSchema = deckItemConfig();
const HabitatConfigSchema = deckItemConfig();
const ExtinctionConfigSchema = deckItemConfig();
const DisasterConfigSchema = deckItemConfig();

const PlantConfigSchema = deckItemConfig({
  elements: z.array(z.string()),
  habitats: z.array(z.string()),
  abilities: z.array(abilityNameSchema),
  flora_type: floraTypeSchema,
});

const AnimalConfigSchema = deckItemConfig({
  habitats: z.array(z.string()),
  abilities: z.array(abilityNameSchema),
  fauna_type: faunaTypeSchema,
});

function getRelatedFieldRefiner(
  items: string[],
  relatedField: string,
): [(data: Record<string, unknown>) => boolean, (data: Record<string, unknown>) => { message: string }] {
  return [
    (data: Record<string, unknown>) =>
      chain(assign({}, ...items.map((name) => data[name])))
        .entries()
        .flatMap(([, config]) => config[relatedField])
        .difference(keys(data[relatedField]))
        .isEmpty()
        .value(),
    (data: Record<string, unknown>) => ({
      path: [`${items.join(" | ")}`],
      message:
        chain(assign({}, ...items.map((name) => data[name])))
          .entries()
          .flatMap(([, config]) => config[relatedField])
          .difference(keys(data[relatedField]))
          .map((v) => `Not a valid ${relatedField} name: '${v}'`)
          .join(", ") + "",
    }),
  ];
}

const DeckConfigSchema = z
  .object({
    assets_prefix: z.string(),
    per_player: z.object({
      abilities: z.record(AbilityConfigSchema),
      disasters: z.record(DisasterConfigSchema),
      elements: z.record(ElementConfigSchema),
    }),
    abilities: z.record(AbilityConfigSchema),
    elements: z.record(ElementConfigSchema),
    plants: z.record(PlantConfigSchema),
    animals: z.record(AnimalConfigSchema),
    habitats: z.record(HabitatConfigSchema),
    extinctions: z.record(ExtinctionConfigSchema),
    disasters: z.record(DisasterConfigSchema),
  })
  .refine(...getRelatedFieldRefiner(["animals", "plants"], "habitats"))
  .refine(...getRelatedFieldRefiner(["animals", "plants"], "abilities"))
  .refine(...getRelatedFieldRefiner(["plants"], "elements"));

export type DeckConfig = z.infer<typeof DeckConfigSchema>;
export type AbilityConfig = z.infer<typeof AbilityConfigSchema>;
export type PlantConfig = z.infer<typeof PlantConfigSchema>;
export type AnimalConfig = z.infer<typeof AnimalConfigSchema>;
export type ElementConfig = z.infer<typeof ElementConfigSchema>;
export type HabitatConfig = z.infer<typeof HabitatConfigSchema>;
export type ExtinctionConfig = z.infer<typeof ExtinctionConfigSchema>;
export type DisasterConfig = z.infer<typeof DisasterConfigSchema>;

export { DeckConfigSchema };
