# CoMapeo Configuration Deconstructor

[![.github/workflows/publish-npm.yml](https://github.com/digidem/mapeo-config-deconstructor/actions/workflows/publish-npm.yml/badge.svg?branch=main)](https://github.com/digidem/mapeo-config-deconstructor/actions/workflows/publish-npm.yml)

Mapeo Configuration Deconstructor is a tool designed to simplify the process of creating and managing CoMapeo configurations. It provides a set of utilities to deconstruct a CoMapeo configuration into an config folder that can be re-built using [mapeo-settings-builder](https://github.com/digidem/mapeo-settings-builder).

## Features

- Deconstructs a `.comapeocat` (zip) configuration file to an output folder.
- Deconstructs a `.mapeosettings` (tar) configuration file to an output folder.
- Deconstructs SVG sprite from a configuration folder to an output folder.
- Deconstructs `translations.json` into separate language files in the `messages` directory.
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
