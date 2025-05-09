const fs = require("fs");
const path = require("path");
const { parseStringPromise, Builder } = require("xml2js");
const tar = require("tar");
const AdmZip = require("adm-zip");
const crypto = require("crypto");
const mkdirp = require("mkdirp");

const DEBUG = process.env.DEBUG === "true";

const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

/**
 * Detects the file format based on the file extension
 * @param {string} filePath - Path to the file
 * @returns {string|null} - 'mapeosettings', 'comapeocat', or null if unknown
 */
function detectFileFormat(filePath) {
  if (!filePath) return null;

  if (filePath.endsWith(".mapeosettings")) {
    return "mapeosettings";
  } else if (filePath.endsWith(".comapeocat")) {
    return "comapeocat";
  }

  return null;
}

async function extractConfig(configPath, outputFolder) {
  log("Starting extraction of config...");
  if (!configPath) {
    console.error("Please provide a configPath as the first argument.");
    process.exit(1);
  }
  const stats = fs.lstatSync(configPath);
  let metadataPath;

  if (stats.isFile()) {
    log("Config path is a file. Creating temporary folder...");
    const uid = crypto.randomBytes(16).toString("hex");
    const rootDir = process.env.ROOT_DIR || "/tmp";
    const tmpFolder = outputFolder || `${rootDir}/mapeo-settings-${uid}`;
    fs.mkdirSync(tmpFolder, { recursive: true });
    log("Temporary folder created. Extracting config...");

    // Detect file format
    const fileFormat = detectFileFormat(configPath);
    log(`Detected file format: ${fileFormat}`);

    if (fileFormat === "mapeosettings") {
      // Extract .mapeosettings file (tar format)
      log(`Extracting .mapeosettings file: ${configPath}`);
      try {
        await tar.x({
          file: configPath,
          cwd: tmpFolder,
          onentry: (entry) => {
            if (entry.path.endsWith(".mapeosettings")) {
              configPath = path.join(tmpFolder, entry.path);
              log(`Config path updated to: ${configPath}`);
            }
          },
        });
        log(`Successfully extracted .mapeosettings file to ${tmpFolder}`);
      } catch (error) {
        console.error(`Error extracting .mapeosettings file: ${error.message}`);
        process.exit(1);
      }
    } else if (fileFormat === "comapeocat") {
      // Extract .comapeocat file (zip format)
      log(`Extracting .comapeocat file: ${configPath}`);
      try {
        const zip = new AdmZip(configPath);
        zip.extractAllTo(tmpFolder, true);
        log(`Successfully extracted .comapeocat file to ${tmpFolder}`);
      } catch (error) {
        console.error(`Error extracting .comapeocat file: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.error(
        "Unsupported file format. Please provide a .mapeosettings or .comapeocat file.",
      );
      process.exit(1);
    }

    if (DEBUG) {
      try {
        const files = fs.readdirSync(tmpFolder);
        log(`Contents of ${tmpFolder}:`, files);
      } catch (err) {
        log(`Error reading directory: ${err.message}`);
      }
    }

    metadataPath = path.join(tmpFolder, "metadata.json");
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    const configName = metadata.name;
    const finalPath = outputFolder || path.cwd();
    return {
      configFolder: tmpFolder,
      outputFolder: finalPath,
      configName,
    };
  } else if (!stats.isDirectory()) {
    console.error("Invalid config path. It should be a file or a directory.");
    process.exit(1);
  }

  log("Config path is a directory. No extraction needed.");
  metadataPath = path.join(configPath, "metadata.json");
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const configName = metadata.name;
  const finalPath = outputFolder || path.cwd();
  return {
    configFolder: configPath,
    outputFolder: finalPath,
    configName,
  };
}

/**
 * Detects if the file format is CoMapeo based on the presence of certain fields
 * @param {Object} field - The field object to check
 * @returns {boolean} - True if the field is in CoMapeo format
 */
function isCoMapeoFormat(field) {
  return (
    field.hasOwnProperty("tagKey") ||
    (field.options &&
      Array.isArray(field.options) &&
      field.options.length > 0 &&
      typeof field.options[0] === "object")
  );
}

/**
 * Normalizes field types to be compatible with both Mapeo and CoMapeo
 * @param {Object} field - The field object to normalize
 * @returns {Object} - The normalized field object
 */
function normalizeFieldType(field) {
  // Make a copy of the field to avoid modifying the original
  const normalizedField = { ...field };

  // Detect if this is a CoMapeo format field
  const isCoMapeo = isCoMapeoFormat(field);

  // Convert field types
  if (normalizedField.type === "textarea") {
    normalizedField.type = "text";
  } else if (normalizedField.type === "select_one") {
    normalizedField.type = "selectOne";
  } else if (normalizedField.type === "select_many") {
    normalizedField.type = "selectMultiple";
  }

  // Convert Mapeo format to CoMapeo format
  if (!isCoMapeo) {
    // Convert key to tagKey
    if (normalizedField.key && !normalizedField.tagKey) {
      normalizedField.tagKey = normalizedField.key;
      delete normalizedField.key;
    }

    // Convert placeholder to helperText
    if (normalizedField.placeholder && !normalizedField.helperText) {
      normalizedField.helperText = normalizedField.placeholder;
      delete normalizedField.placeholder;
    }

    // Convert options from array of strings to array of objects
    if (
      normalizedField.options &&
      Array.isArray(normalizedField.options) &&
      normalizedField.options.length > 0 &&
      typeof normalizedField.options[0] === "string"
    ) {
      normalizedField.options = normalizedField.options.map((option) => ({
        label: option,
        value: option,
      }));
    }

    // Add universal property if missing
    if (!normalizedField.hasOwnProperty("universal")) {
      normalizedField.universal = false;
    }
  }

  return normalizedField;
}

async function desconstructPresets(configFolder, outputFolder) {
  try {
    log(`Desconstructing presets from ${configFolder} to ${outputFolder}`);
    const file = fs.readFileSync(path.join(configFolder, "presets.json"));
    const json = JSON.parse(file);

    for (const i of Object.keys(json)) {
      if (i === "presets" || i === "fields") {
        fs.mkdirSync(path.join(outputFolder, i), { recursive: true });

        for (const [key, value] of Object.entries(json[i])) {
          const filePath = path.join(outputFolder, i, `${key}.json`);

          // Normalize field types if this is a field
          const valueToWrite =
            i === "fields" ? normalizeFieldType(value) : value;

          fs.writeFileSync(filePath, JSON.stringify(valueToWrite));
          log(`Wrote ${filePath}`);
        }
      } else if (i === "defaults") {
        const filePath = path.join(outputFolder, `${i}.json`);
        fs.writeFileSync(filePath, JSON.stringify(json[i]));
        log(`Wrote ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error in desconstructPresets: ${error}`);
  }
}

async function desconstructSvgSprite(configFolder, outputFolder) {
  try {
    log(`Desconstructing SVG sprite from ${configFolder} to ${outputFolder}`);

    // Check if icons.svg exists
    const iconsPath = path.join(configFolder, "icons.svg");
    if (!fs.existsSync(iconsPath)) {
      log(
        `No icons.svg found in ${configFolder}, skipping SVG sprite deconstruction`,
      );
      return;
    }

    const file = fs.readFileSync(iconsPath).toString();
    const parsed = await parseStringPromise(file);
    fs.mkdirSync(path.join(outputFolder, "icons"), { recursive: true });

    if (parsed?.svg?.symbol && parsed.svg.symbol.length > 0) {
      for (const e of parsed.svg.symbol) {
        const builder = new Builder();
        let newSvg = {
          svg: {
            ...e,
          },
        };
        const newXml = builder.buildObject(newSvg);
        const splitName = e["$"].id.split("-12");
        const fileName =
          splitName.length > 1
            ? `${splitName[0]}-24px.svg`
            : `${splitName[0]}-100px.svg`;
        const filePath = path.join(outputFolder, "icons", fileName);
        fs.writeFileSync(filePath, newXml);
        log(`Wrote ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error in desconstructSvgSprite: ${error}`);
  }
}

/**
 * Flattens a nested translations object into a flat structure with dot notation keys
 * and creates separate language files in the messages directory.
 *
 * @param {string} configFolder - Path to the folder containing translations.json
 * @param {string} outputFolder - Base directory where the messages folder will be created
 */
async function flattenTranslations(configFolder, outputFolder) {
  try {
    const translationsPath = path.join(configFolder, "translations.json");
    if (!fs.existsSync(translationsPath)) {
      log(
        `No translations.json found in ${configFolder}, skipping translation flattening`,
      );
      return;
    }

    log(`Flattening translations from ${translationsPath}`);
    const translationsData = fs.readFileSync(translationsPath, "utf8");
    const translations = JSON.parse(translationsData);

    // Create the messages directory
    const messagesDir = path.join(outputFolder, "messages");
    mkdirp.sync(messagesDir);
    log(`Created messages directory at ${messagesDir}`);

    // Process each language
    for (const lang of Object.keys(translations)) {
      log(`Processing language: ${lang}`);
      const langData = translations[lang];
      const flattenedData = {};

      // Process presets
      if (langData.presets) {
        for (const presetKey of Object.keys(langData.presets)) {
          const preset = langData.presets[presetKey];

          if (preset.name) {
            flattenedData[`presets.${presetKey}.name`] = {
              description: `The name of preset '${presetKey}'`,
              message: preset.name,
            };
          }
        }
      }

      // Process fields
      if (langData.fields) {
        for (const fieldKey of Object.keys(langData.fields)) {
          const field = langData.fields[fieldKey];

          if (field.label) {
            flattenedData[`fields.${fieldKey}.label`] = {
              description: `Label for field '${fieldKey}'`,
              message: field.label,
            };
          }

          if (field.helperText) {
            flattenedData[`fields.${fieldKey}.helperText`] = {
              description: `Helper text for field '${fieldKey}'`,
              message: field.helperText,
            };
          }
        }
      }

      // Skip categories if empty
      if (langData.categories && Object.keys(langData.categories).length > 0) {
        for (const categoryKey of Object.keys(langData.categories)) {
          const category = langData.categories[categoryKey];

          if (category.name) {
            flattenedData[`categories.${categoryKey}.name`] = {
              description: `The name of category '${categoryKey}'`,
              message: category.name,
            };
          }
        }
      }

      // Sort keys alphabetically for consistency
      const sortedData = {};
      Object.keys(flattenedData)
        .sort()
        .forEach((key) => {
          sortedData[key] = flattenedData[key];
        });

      // Write the flattened data to a language-specific file
      const outputFile = path.join(messagesDir, `${lang}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(sortedData, null, 2), "utf8");

      log(`Created ${outputFile}`);
    }

    log("Translation flattening complete!");
  } catch (error) {
    console.error(`Error in flattenTranslations: ${error}`);
  }
}

const copyFiles = async (configFolder, outputFolder) => {
  try {
    log(`Copying essential files from ${configFolder} to ${outputFolder}`);

    // Copy metadata.json which is needed for package.json creation
    // and defaults.json which is needed for the linter
    // Other files like translations.json are processed separately
    const filesToCopy = ["metadata.json", "defaults.json"];

    for (const file of filesToCopy) {
      const src = path.join(configFolder, file);
      const dest = path.join(outputFolder, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        log(`Copied ${src} to ${dest}`);
      }
    }
  } catch (error) {
    console.error(`Error in copyFiles: ${error}`);
  }
};

async function createPackageJson(configFolder, outputFolder) {
  console.log("Building package.json", outputFolder);
  const packageTemplate = fs.readFileSync(
    path.join(__dirname, "package-template.json"),
    "utf-8",
  );
  const metadata = JSON.parse(
    fs.readFileSync(path.join(configFolder, "metadata.json"), "utf-8"),
  );
  const packageContent = packageTemplate.replace(/{name}/g, metadata.name);
  fs.writeFileSync(path.join(outputFolder, "package.json"), packageContent);
}

/**
 * Cleans up unwanted files from the output folder
 * @param {string} outputFolder - Path to the output folder
 */
async function cleanupOutputFolder(outputFolder) {
  try {
    log(`Cleaning up unwanted files from ${outputFolder}`);

    // List of files to remove
    const filesToRemove = [
      "icons.png",
      "icons.svg",
      "translations.json",
      "VERSION",
      "style.css",
      "presets.json",
    ];

    for (const file of filesToRemove) {
      const filePath = path.join(outputFolder, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log(`Removed ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error in cleanupOutputFolder: ${error}`);
  }
}

// Export core functions
module.exports = {
  desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  createPackageJson,
  extractConfig,
  detectFileFormat,
  flattenTranslations,
  cleanupOutputFolder,
  log,
};
