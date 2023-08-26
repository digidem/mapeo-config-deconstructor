#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const tar = require("tar");
const { v4: uuidv4 } = require('uuid');
const { desconstructPresets, desconstructSvgSprite } = require("./src/index.js");
const { copyFiles } = require("./src/index.js");

let config = process.argv[2];
let outputFolder = process.argv[3];

async function extractConfig(configPath) {
  const stats = fs.lstatSync(configPath);
  if (stats.isFile()) {
    const tempDir = path.join("/tmp", `mapeo-settings-${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    await tar.x({
      file: configPath,
      cwd: tempDir,
      onentry: (entry) => {
        if (entry.path.endsWith(".mapeosettings")) {
          config = path.join(tempDir, entry.path);
        }
      },
    });
  } else if (stats.isDirectory()) {
    config = configPath;
  } else {
    console.error("Invalid config path. It should be a file or a directory.");
    process.exit(1);
  }
}

async function createPackageJson(configFolder, outputFolder) {
  console.log("Building package.json", outputFolder);
  const packageTemplate = fs.readFileSync(path.join(__dirname, "src", "package-template.json"), "utf-8");
  const metadata = JSON.parse(fs.readFileSync(path.join(configFolder, "metadata.json"), "utf-8"));
  const packageContent = packageTemplate.replace(/{name}/g, metadata.name);
  fs.writeFileSync(path.join(outputFolder, "package.json"), packageContent);
}

async function run() {
  if (!config) {
    console.error("Please provide a config as the first argument.");
    process.exit(1);
  }

  await extractConfig(config);

  if (!outputFolder) {
    const { name } = JSON.parse(
      fs.readFileSync(path.join(config, "metadata.json")),
    );
    outputFolder = path.join(config, name);
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
  }

  console.log("Building project", outputFolder);
  await desconstructPresets(config, outputFolder);
  await desconstructSvgSprite(config, outputFolder);
  await copyFiles(config, outputFolder);
  await createPackageJson(config, outputFolder);
  console.log("Done!");
}

run();
