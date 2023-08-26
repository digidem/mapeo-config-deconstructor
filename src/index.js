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

async function extractConfig(config) {
  if (fs.lstatSync(config).isFile()) {
    const uid = crypto.randomBytes(16).toString("hex");
    const tmpFolder = `/tmp/mapeo-settings-${uid}`;
    await tar.x({
      file: config,
      cwd: tmpFolder,
    });
    return tmpFolder;
  }
  return config;
}

async function desconstructPresets(config, outputFolder) {
  try {
    const configFolder = await extractConfig(config);
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

async function desconstructSvgSprite(config, outputFolder) {
  try {
    const configFolder = await extractConfig(config);
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

const copyFiles = async (config, outputFolder) => {
  try {
    const configFolder = await extractConfig(config);
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

module.exports = {
  desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
};
