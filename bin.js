#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { desconstructPresets, desconstructSvgSprite } = require("./src/index.js");
const { copyFiles } = require("./src/index.js");

const config = process.argv[2];
let outputFolder = process.argv[3];

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
