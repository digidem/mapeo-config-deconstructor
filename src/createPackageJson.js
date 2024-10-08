const { fs, path } = require("./utils");

async function createPackageJson(configFolder, outputFolder) {
  console.log("Building package.json", outputFolder);
  const packageTemplate = fs.readFileSync(
    path.join(__dirname, "package-template.json"),
    "utf-8",
  );
  const metadata = JSON.parse(
    fs.readFileSync(path.join(configFolder, "metadata.json"), "utf-8"),
  );
  const packageContent = packageTemplate.replace(/{name}/g, metadata.name);
  fs.writeFileSync(path.join(outputFolder, "package.json"), packageContent);
}

module.exports = createPackageJson;
