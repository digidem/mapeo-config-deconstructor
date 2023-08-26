# Mapeo Configuration Deconstructor

Mapeo Configuration Deconstructor is a tool designed to simplify the process of creating and managing Mapeo configurations. It provides a set of utilities to deconstruct a Mapeo configuration into an config folder that can be re-built using [mapeo-settings-builder](https://github.com/digidem/mapeo-settings-builder).

## Features
- Deconstructs presets from a configuration folder to an output folder.
- Deconstructs SVG sprite from a configuration folder to an output folder.
- Copies files from a configuration folder to an output folder.
- Creates a `package.json` file in the output folder, with all `{name}` instances substituted by the `metadata.json` name value.

## Usage
You can use Mapeo Configuration Deconstructor via `npx` or install it globally using `npm`.

### Using npx
```bash
npx mapeo-config-deconstructor [configFolder] [outputFolder]
```

### Installing globally
```bash
npm install -g mapeo-config-deconstructor
```
Then you can run it with:
```bash
mapeo-config-deconstructor [configFolder] [outputFolder]
```

## TODO
- Change configFolder input to be config. Check if it's a folder or file. In case it's a file use tar to extract `.mapeosettings` file into a /tmp/mapeo-settings-{random-uid} folder where the same logic for folder can be applied. Apply changes to README, bin.js and src/index.js files.
- Improve error handling and reporting.
