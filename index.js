const fs = require('fs')
const path = require('path')
const { parseStringPromise, Builder } = require('xml2js')

async function desconstructPresets(configFolder) {
    const file = await fs.readFileSync(path.join(configFolder, 'presets.json'))
    const json = await JSON.parse(file)
    Object.keys(json).map(async i => {
        if (i === 'presets' || i === 'fields') {
            Object.entries(json[i]).map(async ([key, value]) => {
                await fs.mkdirSync(path.join(configFolder, i), { recursive: true })
                const filePath = path.join(configFolder, i, `${key}.json`)
                await fs.writeFileSync(filePath, JSON.stringify(value))
            })
        } else if (i === 'defaults') {
            const filePath = path.join(configFolder, `${i}.json`)
            await fs.writeFileSync(filePath, JSON.stringify(json[i]))
        }
    })
}

async function desconstructSvgSprite(configFolder) {
    const file = await fs.readFileSync(path.join(configFolder, 'icons.svg')).toString()
    const parsed = await parseStringPromise(file)
    await fs.mkdirSync(path.join(configFolder, 'icons'), { recursive: true })
    if (parsed?.svg?.symbol.length > 0) {
        parsed.svg.symbol.forEach(async e => {
            const builder = new Builder()
            let newSvg = {
                svg: {
                    ...e
                }
            }
            const newXml = builder.buildObject(newSvg);
            const splitName = e['$'].id.split('-12')
            const fileName = splitName.length > 1 ? `${splitName[0]}-24px.svg` : `${splitName[0]}-100px.svg`
            const filePath = path.join(configFolder, 'icons', fileName)
            await fs.writeFileSync(filePath, newXml)
        });
    }
}

module.exports = {
    desconstructPresets,
    desconstructSvgSprite
}
