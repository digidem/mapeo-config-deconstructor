#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { desconstructPresets, desconstructSvgSprite } = require("./index.js");
const { copyFiles } = require("./index.js");

const configFolder = process.argv[2];
let outputFolder = process.argv[3];

async function run() {
  if (!configFolder) {
    console.error("Please provide a config folder as the first argument.");
    process.exit(1);
  }

  if (!outputFolder) {
    const { name } = JSON.parse(
      fs.readFileSync(path.join(configFolder, "metadata.json")),
    );
    outputFolder = path.join(configFolder, name);
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
  }

  console.log("Building project", outputFolder);
  await desconstructPresets(configFolder, outputFolder);
  await desconstructSvgSprite(configFolder, outputFolder);
  await copyFiles(configFolder, outputFolder);
  console.log("Done!");
}

run();
