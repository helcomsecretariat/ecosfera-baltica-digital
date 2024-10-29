import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { ensureDir, copy } from "fs-extra";

const imgRegexp = /\.(webp|png|jpg|jpeg|svg)$/i;

async function getDirs(inputDir) {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((dir) => dir.name);
}

async function getImageFiles(dir) {
  const imageFiles = [];
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isFile() && imgRegexp.test(file.name)) {
      imageFiles.push(fullPath);
    }
  }

  return imageFiles;
}

async function processDir(inputDir, outputDir, subDir) {
  const inputSubDir = path.join(inputDir, subDir);
  const outputSubDir = path.join(outputDir, subDir);

  await ensureDir(outputSubDir);

  const imageFiles = await getImageFiles(inputSubDir);
  const manifest = [];

  for (const filePath of imageFiles) {
    const relativePath = path.relative(inputSubDir, filePath);
    const outputFilePath = path.join(outputSubDir, relativePath).replace(imgRegexp, ".avif");
    await sharp(filePath).toFormat("avif").toFile(outputFilePath);

    manifest.push(path.basename(outputFilePath));

    console.log(`Converted: ${filePath} → ${outputFilePath}`);
  }

  const manifestPath = path.join(outputSubDir, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written to: ${manifestPath}`);
}

const inputDirectory = process.argv[2];
const outputDirectory = process.argv[3];

if (!inputDirectory || !outputDirectory) {
  console.error("Please provide both input and output directories.");
  process.exit(1);
}

async function processAllDirs(inputDir, outputDir) {
  const dirs = await getDirs(inputDir);
  for (const dir of dirs) {
    await processDir(inputDir, outputDir, dir);
  }
  console.log("All directories processed!");
}

processAllDirs(inputDirectory, outputDirectory).catch(console.error);
