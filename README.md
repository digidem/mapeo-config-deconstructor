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

You can use Mapeo Configuration Deconstructor via the command line or programmatically in your Node.js applications.
`outputFolder` defaults to directory where program is executed from.

### Command Line Usage

#### Using npx

```bash
npx mapeo-config-deconstructor [config] [outputFolder]
```

#### Installing globally

```bash
npm install -g mapeo-config-deconstructor
```

Then you can run it with:

```bash
mapeo-config-deconstructor [config] [outputFolder]
```

### Programmatic Usage

You can also use Mapeo Configuration Deconstructor programmatically in your Node.js applications:

```javascript
const { deconstruct } = require("mapeo-config-deconstructor");

async function run() {
  try {
    const result = await deconstruct({
      configPath: "/path/to/config.mapeosettings",
      outputFolder: "/path/to/output",
    });

    if (result.success) {
      console.log(
        `Successfully deconstructed ${result.configName} to ${result.outputFolder}`,
      );
    } else {
      console.error(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
}

run();
```

#### API Options

The `deconstruct` function accepts an options object with the following properties:

| Option            | Type    | Required | Description                                                                 |
| ----------------- | ------- | -------- | --------------------------------------------------------------------------- |
| `configPath`      | string  | Yes      | Path to the configuration file (.mapeosettings or .comapeocat) or directory |
| `outputFolder`    | string  | No       | Path to the output folder. If not provided, a temporary folder will be used |
| `skipCleanup`     | boolean | No       | Whether to skip cleaning up unwanted files (default: false)                 |
| `skipPackageJson` | boolean | No       | Whether to skip creating package.json (default: false)                      |

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
