/**
 * API module for programmatic usage of mapeo-config-deconstructor
 *
 * This module provides a clean interface for using mapeo-config-deconstructor
 * programmatically in Node.js applications.
 */

// Import functions directly to avoid circular dependencies
const fs = require("fs");
const path = require("path");
const index = require("./index.js");

/**
 * Deconstructs a Mapeo or CoMapeo configuration file into individual components
 *
 * @param {Object} options - Configuration options
 * @param {string} options.configPath - Path to the configuration file (.mapeosettings or .comapeocat) or directory
 * @param {string} options.outputFolder - Path to the output folder
 * @param {boolean} [options.skipCleanup=false] - Whether to skip cleaning up unwanted files
 * @param {boolean} [options.skipPackageJson=false] - Whether to skip creating package.json
 * @returns {Promise<Object>} - Object containing information about the deconstruction
 */
async function deconstruct(options) {
  if (!options || !options.configPath) {
    throw new Error("configPath is required");
  }

  const {
    configPath,
    outputFolder,
    skipCleanup = false,
    skipPackageJson = false,
  } = options;

  try {
    // Extract the configuration
    const {
      configFolder,
      outputFolder: resolvedOutputFolder,
      configName,
    } = await index.extractConfig(configPath, outputFolder);

    // Deconstruct the configuration
    await index.desconstructPresets(configFolder, resolvedOutputFolder);
    await index.desconstructSvgSprite(configFolder, resolvedOutputFolder);
    await index.copyFiles(configFolder, resolvedOutputFolder);
    await index.flattenTranslations(configFolder, resolvedOutputFolder);

    // Create package.json if not skipped
    if (!skipPackageJson) {
      await index.createPackageJson(configFolder, resolvedOutputFolder);
    }

    // Clean up unwanted files if not skipped
    if (!skipCleanup) {
      await index.cleanupOutputFolder(resolvedOutputFolder);
    }

    return {
      success: true,
      configName,
      outputFolder: resolvedOutputFolder,
      configFolder,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  deconstruct,
};
