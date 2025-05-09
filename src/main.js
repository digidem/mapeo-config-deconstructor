/**
 * Main entry point for the mapeo-config-deconstructor package
 *
 * This file exports both the core functions and the API for programmatic usage.
 */

// Import core functions
const core = require("./index");

// Import API
const api = require("./api");

// Export everything
module.exports = {
  // Core functions
  ...core,

  // API for programmatic usage
  ...api,
};
