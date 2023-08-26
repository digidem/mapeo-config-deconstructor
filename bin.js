#!/usr/bin/env node
const { desconstructPresets, desconstructSvgSprite } = require('./index.js')
const configFolder = process.argv[2]

if (!configFolder) {
    console.error('Please provide a config folder as the first argument.')
    process.exit(1)
}

desconstructPresets(configFolder)
desconstructSvgSprite(configFolder)
