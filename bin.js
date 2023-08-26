#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { desconstructPresets, desconstructSvgSprite } = require('./index.js')
const configFolder = process.argv[2]
let outputFolder = process.argv[3]

if (!configFolder) {
    console.error('Please provide a config folder as the first argument.')
    process.exit(1)
}

if (!outputFolder) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(configFolder, 'package.json')))
    outputFolder = path.join(configFolder, packageJson.name)
}

const { copyFiles } = require('./index.js')

desconstructPresets(configFolder, outputFolder)
desconstructSvgSprite(configFolder, outputFolder)
copyFiles(configFolder, outputFolder)
