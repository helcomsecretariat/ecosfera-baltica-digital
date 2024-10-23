import fs from "fs";
import csvParser from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";

// Process command line arguments for input CSV and output JSON file paths
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Please provide input CSV file and output JSON file paths.");
  process.exit(1);
}
const inputCsv = args[0];
const outputJson = args[1];

// Determine the script's directory and use it as the base path
const scriptUrl = import.meta.url;
const scriptPath = fileURLToPath(scriptUrl);
const scriptDir = path.dirname(scriptPath);
const templateJson = args[2] ? path.resolve(args[2]) : path.join(scriptDir, "deck-template.json");

// Read the template JSON file and parse it
let resultJson;
try {
  const templateData = fs.readFileSync(templateJson, "utf8");
  resultJson = JSON.parse(templateData);
} catch (error) {
  console.error("Error reading or parsing the template JSON file:", error.message);
  process.exit(1);
}

const habitatColumns = ["Ice", "Coast", "Pelagic", "Rivers", "Soft bottom", "Hard benthic"];
const resourceColumns = ["Sun", "Oxygen", "Salinity", "Nutrients", "Temperature"];
const abilityColumns = ["Pass a card", "Refresh", "Extra card", "Lift an expansion card"];
const abilityMapping = {
  "Pass a card": "move",
  Refresh: "refresh",
  "Extra card": "plus",
  "Lift an expansion card": "special",
};

// Function to process the CSV file
function processRow(row) {
  // Skip rows where the first cell (Species) is empty
  if (!row["Type"] || row["Category"] === "") {
    return;
  }

  let speciesType = row["Type"].toLowerCase() === "basal producer" ? "plants" : "animals";
  let speciesName = row["Species"].trim().replace(/\s*\(.*?\)\s*/g, "");
  const catName = speciesType === "plants" ? "flora_type" : "fauna_type";

  if (speciesName) {
    let speciesData = {
      elements: [],
      habitats: [],
      abilities: [],
      [catName]: row["Category"].trim().toLowerCase().replace(/\*/g, ""),
    };

    // Add elements/resources
    resourceColumns.forEach((col) => {
      if (row[col].trim() !== "") {
        speciesData.elements.push(col.toLowerCase());
      }
    });

    // Add habitats
    habitatColumns.forEach((col) => {
      if (row[col].trim() !== "") {
        speciesData.habitats.push(col.toLowerCase());
      }
    });

    // Add abilities
    abilityColumns.forEach((col) => {
      if (row[col].trim() !== "") {
        let mappedAbility = abilityMapping[col];
        if (mappedAbility) {
          speciesData.abilities.push(mappedAbility);
        }
      }
    });

    resultJson[speciesType][speciesName] = speciesData;
  }
}

// Reading the CSV file and processing it
fs.createReadStream(inputCsv)
  .pipe(
    csvParser({
      skipLines: 1,
    }),
  )
  .on("data", (row) => {
    processRow(row);
  })
  .on("end", () => {
    // Save the result to a JSON file
    fs.writeFileSync(outputJson, JSON.stringify(resultJson, null, 2));
    console.log("CSV successfully converted to JSON.");
  });
