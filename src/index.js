const extractConfig = require("./extractConfig");
const desconstructPresets = require("./desconstructPresets");
const desconstructSvgSprite = require("./desconstructSvgSprite");
const copyFiles = require("./copyFiles");
const createPackageJson = require("./createPackageJson");

async function buildProject(config, argOutputFolder) {
  console.log("Building project", config);
  const { configFolder, outputFolder } = await extractConfig(
    config,
    argOutputFolder
  );
  await desconstructPresets(configFolder, outputFolder);
  await desconstructSvgSprite(configFolder, outputFolder);
  await copyFiles(configFolder, outputFolder);
  await createPackageJson(configFolder, outputFolder);
  console.log("Done!");
  return { configFolder, outputFolder };
}

module.exports = {
  desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  createPackageJson,
  extractConfig,
  buildProject,
};
