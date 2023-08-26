# Mapeo Configuration Deconstructor

Mapeo Configuration Deconstructor is a tool designed to simplify the process of creating and managing Mapeo configurations. It provides a set of utilities to deconstruct a Mapeo configuration into its constituent parts, making it easier to understand, modify, and reconstruct.

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
- Use tar to extract `.mapeosettings` file.
- Turn the tool into an executable and get settings file from ARG.
- Improve error handling and reporting.
- Add more customization options.
