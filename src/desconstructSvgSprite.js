const { log, fs, path } = require("./utils");
const { parseStringPromise, Builder } = require("xml2js");

async function desconstructSvgSprite(configFolder, outputFolder) {
  try {
    log(`Desconstructing SVG sprite from ${configFolder} to ${outputFolder}`);
    const file = await fs
      .readFileSync(path.join(configFolder, "icons.svg"))
      .toString();
    const parsed = await parseStringPromise(file);
    await fs.mkdirSync(path.join(outputFolder, "icons"), { recursive: true });
    if (parsed?.svg?.symbol.length > 0) {
      parsed.svg.symbol.forEach(async (e) => {
        const builder = new Builder();
        let newSvg = {
          svg: {
            ...e,
          },
        };
        const newXml = builder.buildObject(newSvg);
        const splitName = e["$"].id.split("-12");
        const fileName =
          splitName.length > 1
            ? `${splitName[0]}-24px.svg`
            : `${splitName[0]}-100px.svg`;
        const filePath = path.join(outputFolder, "icons", fileName);
        await fs.writeFileSync(filePath, newXml);
        log(`Wrote ${filePath}`);
      });
    }
  } catch (error) {
    console.error(`Error in desconstructSvgSprite: ${error}`);
  }
}

module.exports = desconstructSvgSprite;
