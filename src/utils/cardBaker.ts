import type { DeckConfig } from "@/decks/schema";
import { getHabitatIconTextures, getElementIconTextures, ElementName, getAbilityIconTextures } from "@/lib/utils";
import { Card, CardType, HabitatName, AbilityName, PlantCard, AnimalCard } from "@/state/types";
import { Texture } from "three";

const JOSEFIN_ITALIC = "/fonts/josefin-sans-v32-latin-300italic.ttf";

// Font preloading
const fontPromise = new FontFace("CardNameFont", `url(${JOSEFIN_ITALIC})`).load().then((font) => {
  document.fonts.add(font);
  return font;
});

// Habitat icons preloading
const habitatIconsPromise = (() => {
  const habitatIconTextures = getHabitatIconTextures();
  const loadedIcons = new Map<HabitatName, Promise<HTMLImageElement>>();

  Object.entries(habitatIconTextures).forEach(([habitat, path]) => {
    loadedIcons.set(habitat as HabitatName, loadImage(path));
  });

  return loadedIcons;
})();

const NAME_SIZE = 14;
const NAME_SHADOW = {
  color: "rgba(0, 0, 0, 1)",
  blur: 3,
  offsetX: 1,
  offsetY: 1,
} as const;
const NAME_MARGIN_BOTTOM = 7;

// Habitat rendering constants
const HABITAT_ICON_SIZE = 12;
const HABITAT_SPACING = 0.2;
const HABITAT_CONTAINER_PADDING = 3;
const PADDING_MAP = {
  animal: [6, 6, 8, 6],
  plant: [6, 6, 2, 6],
  element: [6, 6, 6, 6],
  disaster: [6, 6, 6, 6],
  policy: [6, 6, 6, 6],
} as const;

const ELEMENT_ICON_SIZE = 15;
const ELEMENTS_BACKGROUND_HEIGHT = 18;

const ABILITY_ICON_SIZE = HABITAT_ICON_SIZE + HABITAT_CONTAINER_PADDING * 2;
const ABILITY_ICON_SPACING = 3;

async function loadImage(baseImageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const baseImage = new Image();
    baseImage.crossOrigin = "anonymous";
    baseImage.onload = () => resolve(baseImage);
    baseImage.onerror = reject;
    baseImage.src = baseImageUrl;
  });
}

async function setupCanvas(texture: Texture): Promise<[HTMLCanvasElement, CanvasRenderingContext2D, number]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = texture.image.width;
  canvas.height = texture.image.height;
  const coordScale = canvas.width / 90;

  // Draw texture's image directly to canvas
  ctx.drawImage(texture.image, 0, 0);

  return [canvas, ctx, coordScale];
}

async function renderName(
  ctx: CanvasRenderingContext2D,
  name: string,
  canvas: HTMLCanvasElement,
  coordScale: number,
  extraPadding: number = 0,
): Promise<void> {
  // Wait for font to be loaded
  await fontPromise;

  const fontSize = NAME_SIZE * coordScale;
  ctx.font = `italic 300 ${fontSize}px "CardNameFont"`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Word wrapping
  const maxWidth = canvas.width * 0.95;
  const words = name.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    // Handle long words that need to be broken
    if (ctx.measureText(word).width > maxWidth) {
      if (currentLine) lines.push(currentLine);

      // Break long word
      let remainingWord = word;
      while (remainingWord.length > 0) {
        let breakIndex = remainingWord.length;
        while (breakIndex > 0 && ctx.measureText(remainingWord.substring(0, breakIndex)).width > maxWidth) {
          breakIndex--;
        }
        if (breakIndex === 0) breakIndex = 1;

        lines.push(remainingWord.substring(0, breakIndex));
        remainingWord = remainingWord.substring(breakIndex);
      }
      currentLine = "";
      continue;
    }

    // Normal word wrapping
    const testLine = currentLine ? currentLine + " " + word : word;
    if (ctx.measureText(testLine).width < maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Render text with shadow
  const lineHeight = fontSize * 1.2;
  const totalHeight = lineHeight * lines.length;
  const startY = canvas.height - NAME_MARGIN_BOTTOM - totalHeight - extraPadding;

  ctx.shadowColor = NAME_SHADOW.color;
  ctx.shadowBlur = NAME_SHADOW.blur * coordScale;
  ctx.shadowOffsetX = NAME_SHADOW.offsetX * coordScale;
  ctx.shadowOffsetY = NAME_SHADOW.offsetY * coordScale;

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight + lineHeight / 2;
    ctx.fillText(line, canvas.width / 2, y);
  });

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

async function loadHabitatImage(habitatName: HabitatName): Promise<HTMLImageElement> {
  const imagePromise = habitatIconsPromise.get(habitatName)!;
  return imagePromise;
}

async function renderHabitats(
  ctx: CanvasRenderingContext2D,
  habitats: HabitatName[],
  cardType: CardType,
  coordScale: number,
): Promise<void> {
  if (!["animal", "plant"].includes(cardType) || !habitats || habitats.length === 0) {
    return;
  }

  const [paddingTop, , , paddingLeft] = PADDING_MAP[cardType];
  const scaledPaddingTop = paddingTop * coordScale;
  const scaledPaddingLeft = paddingLeft * coordScale;
  const scaledHabitatSize = HABITAT_ICON_SIZE * coordScale;
  const scaledSpacing = HABITAT_SPACING * coordScale;
  const scaledContainerPadding = HABITAT_CONTAINER_PADDING * coordScale;

  // Draw white background pill
  const pillWidth = (scaledHabitatSize + scaledSpacing) * habitats.length - scaledSpacing + scaledContainerPadding * 2;
  const pillHeight = scaledHabitatSize + scaledContainerPadding * 2;
  const pillRadius = pillHeight / 2;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(scaledPaddingLeft + pillRadius, scaledPaddingTop);
  ctx.lineTo(scaledPaddingLeft + pillWidth - pillRadius, scaledPaddingTop);
  ctx.arc(
    scaledPaddingLeft + pillWidth - pillRadius,
    scaledPaddingTop + pillRadius,
    pillRadius,
    -Math.PI / 2,
    Math.PI / 2,
  );
  ctx.lineTo(scaledPaddingLeft + pillRadius, scaledPaddingTop + pillHeight);
  ctx.arc(scaledPaddingLeft + pillRadius, scaledPaddingTop + pillRadius, pillRadius, Math.PI / 2, -Math.PI / 2);
  ctx.fill();

  // Draw habitat icons
  for (let i = 0; i < habitats.length; i++) {
    const habitatImage = await loadHabitatImage(habitats[i]);
    const x =
      scaledPaddingLeft + scaledContainerPadding + scaledHabitatSize / 2 + i * (scaledHabitatSize + scaledSpacing);
    const y = scaledPaddingTop + scaledContainerPadding + scaledHabitatSize / 2;

    ctx.drawImage(
      habitatImage,
      x - scaledHabitatSize / 2,
      y - scaledHabitatSize / 2,
      scaledHabitatSize,
      scaledHabitatSize,
    );
  }
}

async function renderElements(
  ctx: CanvasRenderingContext2D,
  card: Card,
  deckConfig: DeckConfig,
  coordScale: number,
): Promise<void> {
  if (card.type !== "plant" || !card.elements.length) {
    return;
  }

  const scaledElementSize = ELEMENT_ICON_SIZE * coordScale;
  const scaledBackgroundHeight = ELEMENTS_BACKGROUND_HEIGHT * coordScale;
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = PADDING_MAP[card.type].map((n) => n * coordScale);

  // Draw white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, ctx.canvas.height - scaledBackgroundHeight, ctx.canvas.width, scaledBackgroundHeight);

  // Sort elements based on deck ordering
  const elementsOrdering = deckConfig.ordering.find(([type]) => type === "element")![1]!;
  const elementsSorted = elementsOrdering
    .filter((element) => card.elements.includes(element))
    .flatMap((element) => Array.from({ length: card.elements.filter((n) => n === element).length }, () => element));

  // Load element icons
  const elementIconTextures = getElementIconTextures();
  const elementIconPromises = elementsSorted.map((name) => loadImage(elementIconTextures[name as ElementName]));
  const elementIcons = await Promise.all(elementIconPromises);

  // Draw element icons
  elementsSorted.forEach((_, index) => {
    const icon = elementIcons[index];
    const x =
      paddingLeft +
      scaledElementSize / 2 +
      // Center the elements by offsetting by half of the total width
      (ctx.canvas.width - paddingLeft - paddingRight - elementsSorted.length * scaledElementSize) / 2 +
      index * scaledElementSize;
    const y = ctx.canvas.height - paddingBottom - scaledElementSize / 2;

    ctx.drawImage(icon, x - scaledElementSize / 2, y - scaledElementSize / 2, scaledElementSize, scaledElementSize);
  });
}

async function renderAbilities(
  ctx: CanvasRenderingContext2D,
  card: PlantCard | AnimalCard,
  coordScale: number,
  hasMoreThanThreeHabitats: boolean,
): Promise<void> {
  if (!card.abilities?.length || !["plant", "animal"].includes(card.type)) {
    return;
  }

  const scaledAbilitySize = ABILITY_ICON_SIZE * coordScale;
  const scaledAbilitySpacing = ABILITY_ICON_SPACING * coordScale;
  const [paddingTop, paddingRight] = PADDING_MAP[card.type].map((n) => n * coordScale);

  // Load ability icons
  const abilityIconTextures = getAbilityIconTextures();
  const abilityIconPromises = card.abilities.map((name) => loadImage(abilityIconTextures[name]));
  const abilityIcons = await Promise.all(abilityIconPromises);

  // Draw ability icons
  card.abilities.forEach((_, index) => {
    const icon = abilityIcons[index];
    const x = ctx.canvas.width - paddingRight - scaledAbilitySize / 2;
    const y =
      paddingTop +
      scaledAbilitySize / 2 +
      index * (scaledAbilitySize + scaledAbilitySpacing) +
      (hasMoreThanThreeHabitats ? scaledAbilitySize + scaledAbilitySpacing : 0);

    // Draw white circle background
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, scaledAbilitySize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Create circular clip path
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, scaledAbilitySize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw ability icon (will be clipped to circle)
    ctx.drawImage(icon, x - scaledAbilitySize / 2, y - scaledAbilitySize / 2, scaledAbilitySize, scaledAbilitySize);

    // Restore context to remove clip path
    ctx.restore();
  });
}

function logMeasures(card: Card) {
  const measures = performance.getEntriesByType("measure").filter((m) => m.name.includes(card.uid));

  console.table(
    measures
      .map((measure) => ({
        name: measure.name.replace(`-${card.uid}`, ""),
        duration: measure.duration,
        durationStr: `${measure.duration.toFixed(2)}ms`,
      }))
      .sort((a, b) => b.duration - a.duration),
  );
}

// Modify bakeCardTexture to accept either URL or texture
export async function bakeCardTexture(card: Card, baseTexture: Texture, deckConfig: DeckConfig): Promise<string> {
  // Clear existing measurements
  const cardMarks = performance.getEntriesByType("mark").filter((m) => m.name.includes(card.uid));
  cardMarks.forEach((m) => performance.clearMarks(m.name));
  performance
    .getEntriesByType("measure")
    .filter((m) => m.name.includes(card.uid))
    .forEach((m) => performance.clearMeasures(m.name));

  performance.mark(`bake-start-${card.uid}`);

  // Setup canvas directly from texture
  performance.mark(`setupCanvas-start-${card.uid}`);
  const [canvas, ctx, coordScale] = await setupCanvas(baseTexture);
  performance.mark(`setupCanvas-end-${card.uid}`);
  performance.measure(`setupCanvas-${card.uid}`, `setupCanvas-start-${card.uid}`, `setupCanvas-end-${card.uid}`);

  if (card.type === "plant" || card.type === "animal") {
    // Render habitats
    performance.mark(`renderHabitats-start-${card.uid}`);
    await renderHabitats(ctx, card.habitats || [], card.type, coordScale);
    performance.mark(`renderHabitats-end-${card.uid}`);
    performance.measure(
      `renderHabitats-${card.uid}`,
      `renderHabitats-start-${card.uid}`,
      `renderHabitats-end-${card.uid}`,
    );

    // Calculate extra padding for name if elements are present
    const extraPadding = card.type === "plant" ? ELEMENT_ICON_SIZE * coordScale + NAME_MARGIN_BOTTOM * 2 : 0;

    // Render name
    performance.mark(`renderName-start-${card.uid}`);
    await renderName(ctx, card.name, canvas, coordScale, extraPadding);
    performance.mark(`renderName-end-${card.uid}`);
    performance.measure(`renderName-${card.uid}`, `renderName-start-${card.uid}`, `renderName-end-${card.uid}`);

    // Render elements
    performance.mark(`renderElements-start-${card.uid}`);
    await renderElements(ctx, card, deckConfig, coordScale);
    performance.mark(`renderElements-end-${card.uid}`);
    performance.measure(
      `renderElements-${card.uid}`,
      `renderElements-start-${card.uid}`,
      `renderElements-end-${card.uid}`,
    );

    performance.mark(`renderAbilities-start-${card.uid}`);
    await renderAbilities(ctx, card, coordScale, card.habitats?.length > 3);
    performance.mark(`renderAbilities-end-${card.uid}`);
    performance.measure(
      `renderAbilities-${card.uid}`,
      `renderAbilities-start-${card.uid}`,
      `renderAbilities-end-${card.uid}`,
    );
  }

  // Convert to data URL
  performance.mark(`toDataURL-start-${card.uid}`);
  const result = canvas.toDataURL("image/png");
  performance.mark(`toDataURL-end-${card.uid}`);
  performance.measure(`toDataURL-${card.uid}`, `toDataURL-start-${card.uid}`, `toDataURL-end-${card.uid}`);

  performance.mark(`bake-end-${card.uid}`);
  performance.measure(`bake-total-${card.uid}`, `bake-start-${card.uid}`, `bake-end-${card.uid}`);

  // Log all measurements
  logMeasures(card);

  // Clean up measurements
  cardMarks.forEach((m) => performance.clearMarks(m.name));
  performance
    .getEntriesByType("measure")
    .filter((m) => m.name.includes(card.uid))
    .forEach((m) => performance.clearMeasures(m.name));

  return result;
}
