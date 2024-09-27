import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { ensureDir } from "fs-extra";

const imgRegexp = /\.(webp|png|jpg|jpeg|svg)$/i;

async function getAllImageFiles(dir, fileList = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await getAllImageFiles(fullPath, fileList);
    } else if (imgRegexp.test(file.name)) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

async function convertImagesToAvif(inputDir, outputDir) {
  const imageFiles = await getAllImageFiles(inputDir);

  for (const filePath of imageFiles) {
    const relativePath = path.relative(inputDir, filePath);
    const outputFilePath = path.join(outputDir, relativePath).replace(imgRegexp, ".avif");
    await ensureDir(path.dirname(outputFilePath));
    await sharp(filePath).toFormat("avif").toFile(outputFilePath);
    console.log(`Converted: ${filePath} → ${outputFilePath}`);
  }
}

const inputDirectory = process.argv[2];
const outputDirectory = process.argv[3];

if (!inputDirectory || !outputDirectory) {
  console.error("Please provide both input and output directories.");
  process.exit(1);
}

convertImagesToAvif(inputDirectory, outputDirectory)
  .then(() => console.log("All images processed!"))
  .catch(console.error);
