const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEBUG = process.env.DEBUG === "true";

const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

module.exports = {
  log,
  DEBUG,
  fs,
  path,
  crypto
};
