const { log, fs, path } = require("./utils");

async function desconstructPresets(configFolder, outputFolder) {
  try {
    log(`Desconstructing presets from ${configFolder} to ${outputFolder}`);
    const file = await fs.readFileSync(path.join(configFolder, "presets.json"));
    const json = await JSON.parse(file);
    Object.keys(json).map(async (i) => {
      if (i === "presets" || i === "fields") {
        Object.entries(json[i]).map(async ([key, value]) => {
          await fs.mkdirSync(path.join(outputFolder, i), { recursive: true });
          const filePath = path.join(outputFolder, i, `${key}.json`);
          await fs.writeFileSync(filePath, JSON.stringify(value));
          log(`Wrote ${filePath}`);
        });
      } else if (i === "defaults") {
        const filePath = path.join(outputFolder, `${i}.json`);
        await fs.writeFileSync(filePath, JSON.stringify(json[i]));
        log(`Wrote ${filePath}`);
      }
    });
  } catch (error) {
    console.error(`Error in desconstructPresets: ${error}`);
  }
}

module.exports = desconstructPresets;
