const { log, DEBUG, fs, path, crypto } = require("./utils");
const tar = require("tar");

async function extractConfig(configPath, outputFolder) {
  log("Starting extraction of config...");
  if (!configPath) {
    console.error("Please provide a configPath as the first argument.");
    process.exit(1);
  }
  const stats = fs.lstatSync(configPath);
  let metadataPath;
  if (stats.isFile()) {
    log("Config path is a file. Creating temporary folder...");
    const uid = crypto.randomBytes(16).toString("hex");
    const rootDir = process.env.ROOT_DIR || "/tmp";
    const tmpFolder = `${rootDir}/mapeo-settings-${uid}`;
    fs.mkdirSync(tmpFolder, { recursive: true });
    log("Temporary folder created. Extracting config...");
    await tar.x({
      file: configPath,
      cwd: tmpFolder,
      onentry: (entry) => {
        if (entry.path.endsWith(".mapeosettings")) {
          configPath = path.join(tmpFolder, entry.path);
          log(`Config path updated to: ${configPath}`);
        }
      },
    });
    DEBUG &&
      (await fs.readdirSync(tmpFolder, (err, files) => {
        if (err) throw err;
        log(`Contents of ${tmpFolder}:`, files);
      }));
    metadataPath = path.join(tmpFolder, "metadata.json");
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    const configName = metadata.name;
    const finalPath = outputFolder || path.join(path.cwd());
    return {
      configFolder: tmpFolder,
      outputFolder: finalPath,
      configName,
    };
  } else if (!stats.isDirectory()) {
    console.error("Invalid config path. It should be a file or a directory.");
    process.exit(1);
  }
  log("Config path is a directory. No extraction needed.");
  metadataPath = path.join(configPath, "metadata.json");
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const configName = metadata.name;
  return {
    configFolder: configPath,
    outputFolder: finalPath,
    configName,
  };
}

module.exports = extractConfig;
