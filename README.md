# CoMapeo Configuration Deconstructor
[![.github/workflows/publish-npm.yml](https://github.com/digidem/mapeo-config-deconstructor/actions/workflows/publish-npm.yml/badge.svg?branch=main)](https://github.com/digidem/mapeo-config-deconstructor/actions/workflows/publish-npm.yml)

Mapeo Configuration Deconstructor is a tool designed to simplify the process of creating and managing CoMapeo configurations. It provides a set of utilities to deconstruct a CoMapeo configuration into an config folder that can be re-built using [mapeo-settings-builder](https://github.com/digidem/mapeo-settings-builder).

## Features
- Deconstructs a `.comapeocat` (zip) configuration file to an output folder.
- Deconstructs a `.mapeosettings` (tar) configuration file to an output folder.
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

## File Format Support

The tool supports both `.mapeosettings` (tar) and `.comapeocat` (zip) file formats. Both formats contain the same set of files:

- `icons` (directory)
- `icons.json`
- `icons.png`
- `icons.svg`
- `metadata.json`
- `presets.json`
- `style.css`
- `translations.json`
- `VERSION`

### Key Differences Between Formats

#### Field Definitions
- `.comapeocat` uses "tagKey" while `.mapeosettings` uses "key"
- `.comapeocat` uses "type": "selectOne" while `.mapeosettings` uses "type": "select_one"
- `.comapeocat` uses "helperText" while `.mapeosettings` uses "placeholder"
- `.comapeocat` includes "universal: false" in many fields, `.mapeosettings` doesn't
- `.mapeosettings` defines "name" field as type "localized" while `.comapeocat` defines it as "text"

#### Building Type Options
- `.comapeocat` defines options as objects with label/value pairs
- `.mapeosettings` defines options as simple string array

#### Preset Structure
- `.comapeocat` includes additional properties in presets: "color"
- `.mapeosettings`'s presets are more concise without these additional properties
