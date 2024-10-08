const { log, fs, path } = require("./utils");

const copyFiles = async (configFolder, outputFolder) => {
  try {
    log(`Copying files from ${configFolder} to ${outputFolder}`);
    const filesToCopy = ["translation.json", "style.css", "metadata.json"];
    for (const file of filesToCopy) {
      const src = path.join(configFolder, file);
      const dest = path.join(outputFolder, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        log(`Copied ${src} to ${dest}`);
      }
    }
  } catch (error) {
    console.error(`Error in copyFiles: ${error}`);
  }
};

module.exports = copyFiles;
