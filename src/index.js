const fs = require("fs");
const path = require("path");
const { parseStringPromise, Builder } = require("xml2js");
const tar = require("tar");
const crypto = require("crypto");

const DEBUG = process.env.DEBUG === "true";

const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

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
    const tmpFolder = `${rootDir}/mapeo-settings-${uid}`;
    fs.mkdirSync(tmpFolder, { recursive: true });
    log("Temporary folder created. Extracting config...");
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
    DEBUG &&
      (await fs.readdirSync(tmpFolder, (err, files) => {
        if (err) throw err;
        log(`Contents of ${tmpFolder}:`, files);
      }));
    metadataPath = path.join(tmpFolder, "metadata.json");
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    const configName = metadata.name;
    const finalPath = outputFolder || path.join(path.cwd(), configName);
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
  return {
    configFolder: configPath,
    outputFolder: finalPath,
    configName,
  };
}

async function desconstructPresets(configFolder, outputFolder) {
  try {
    log(`Desconstructing presets from ${configFolder} to ${outputFolder}`);
    const file = await fs.readFileSync(path.join(configFolder, "presets.json"));
    const json = await JSON.parse(file);
    Object.keys(json).map(async (i) => {
      if (i === "presets" || i === "fields") {
        Object.entries(json[i]).map(async ([key, value]) => {
          await fs.mkdirSync(path.join(outputFolder, i), { recursive: true });
          const filePath = path.join(outputFolder, i, `${key}.json`);
          await fs.writeFileSync(filePath, JSON.stringify(value));
          log(`Wrote ${filePath}`);
        });
      } else if (i === "defaults") {
        const filePath = path.join(outputFolder, `${i}.json`);
        await fs.writeFileSync(filePath, JSON.stringify(json[i]));
        log(`Wrote ${filePath}`);
      }
    });
  } catch (error) {
    console.error(`Error in desconstructPresets: ${error}`);
  }
}

async function desconstructSvgSprite(configFolder, outputFolder) {
  try {
    log(`Desconstructing SVG sprite from ${configFolder} to ${outputFolder}`);
    const file = await fs
      .readFileSync(path.join(configFolder, "icons.svg"))
      .toString();
    const parsed = await parseStringPromise(file);
    await fs.mkdirSync(path.join(outputFolder, "icons"), { recursive: true });
    if (parsed?.svg?.symbol.length > 0) {
      parsed.svg.symbol.forEach(async (e) => {
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
        await fs.writeFileSync(filePath, newXml);
        log(`Wrote ${filePath}`);
      });
    }
  } catch (error) {
    console.error(`Error in desconstructSvgSprite: ${error}`);
  }
}

const copyFiles = async (configFolder, outputFolder) => {
  try {
    log(`Copying files from ${configFolder} to ${outputFolder}`);
    const filesToCopy = ["translation.json", "style.css", "metadata.json"];
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

module.exports = {
  desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  createPackageJson,
  extractConfig,
};
