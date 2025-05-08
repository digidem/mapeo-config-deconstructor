#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const tar = require("tar");
const {
  desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  extractConfig,
  createPackageJson,
  flattenTranslations,
  cleanupOutputFolder,
} = require("./index.js");

let config = process.argv[2];
let argOutputFolder = process.argv[3];

async function run() {
  console.log("Building project", config);
  const { configFolder, outputFolder } = await extractConfig(
    config,
    argOutputFolder,
  );
  await desconstructPresets(configFolder, outputFolder);
  await desconstructSvgSprite(configFolder, outputFolder);
  await copyFiles(configFolder, outputFolder);
  await flattenTranslations(configFolder, outputFolder);
  await createPackageJson(configFolder, outputFolder);

  // Clean up unwanted files
  await cleanupOutputFolder(outputFolder);

  console.log("Done!");
}

run();
