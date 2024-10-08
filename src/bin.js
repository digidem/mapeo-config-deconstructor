#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const tar = require("tar");
const { buildProject } = require("./index.js");

let config = process.argv[2];
let argOutputFolder = process.argv[3];

buildProject(config, argOutputFolder)
  .then(() => {
    console.log("Project built successfully!");
  })
  .catch((error) => {
    console.error("Error building project:", error);
    process.exit(1);
  });
