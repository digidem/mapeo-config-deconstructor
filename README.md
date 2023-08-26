# Mapeo Configuration Deconstructor

Mapeo Configuration Deconstructor is a tool designed to simplify the process of creating and managing Mapeo configurations. It provides a set of utilities to deconstruct a Mapeo configuration into an config folder that can be re-built using [mapeo-settings-builder](https://github.com/digidem/mapeo-settings-builder).

## Features
- Deconstructs a `.mapeosettings` configuration file to an output folder .
- Deconstructs SVG sprite from a configuration folder to an output folder.
- Copies files (style.css, metadata.json, defaults.json, translations.json) from a configuration folder to an output folder.
- Creates a `package.json` file in the output folder, with the `metadata.json` name value.

## Usage
You can use Mapeo Configuration Deconstructor via `npx` or install it globally using `npm`.
`outputFolder` defaults to directory where program is executed from.

### Using npx
```bash
npx mapeo-config-deconstructor [config] [outputFolder]
```

### Installing globally
```bash
npm install -g mapeo-config-deconstructor
```
Then you can run it with:
```bash
mapeo-config-deconstructor [config] [outputFolder]
```
