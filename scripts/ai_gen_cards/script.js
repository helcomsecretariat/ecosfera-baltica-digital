import { promises as fs } from "fs";
import path from "path";
import OpenAI from "openai";
import { chain } from "lodash-es";
import fetch from "node-fetch";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

const [jsonFilePath, imageDirPath] = process.argv.slice(2);

if (!jsonFilePath || !imageDirPath) {
  console.error("Usage: node script.js <path-to-json> <path-to-image-dir>");
  process.exit(1);
}

const styleDescription = " in color sketch style. pastel colors";

const deckContent = await fs.readFile(jsonFilePath, "utf-8");
const deck = JSON.parse(deckContent);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateImage(name, type) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `single ${name} (${type}) ${styleDescription}`,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    await urlToImageFile(imageUrl, path.join(imageDirPath, `${name.replace(/\s+/g, "_").toLowerCase()}.png`));
  } catch (error) {
    console.error(`Error generating image for ${name}:`, error);
  }
}

const combinedEntities = [
  ...chain(deck.plants)
    .keys()
    .slice(9)
    .map((name) => ({
      name,
      type: deck.plants[name].flora_type,
    }))
    .value(),
  ...chain(deck.animals)
    .keys()
    .slice(9)
    .map((name) => ({
      name,
      type: deck.animals[name].fauna_type,
    }))
    .value(),
];

for (const { name, type } of combinedEntities) {
  await generateImage(name, type);
}

async function urlToImageFile(url, filename) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await fs.writeFile(filename, Buffer.from(buffer));
}
