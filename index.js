const fs = require('fs')
const path = require('path')

async function run () {
    const file = await fs.readFileSync('./presets.json')
    const json = await JSON.parse(file)
    Object.keys(json).map(async i => {
        console.log(i)
        if (i === 'presets' || i === 'fields') {
            Object.entries(json[i]).map(async ([key, value]) => {
                // console.log(key, value)
                await fs.mkdirSync(path.join(__dirname, i), {recursive: true})
                const filePath = path.join(__dirname, i, `${key}.json`)
                console.log(filePath)
                await fs.writeFileSync(filePath, JSON.stringify(value))
            })
        } else if (i === 'defaults') {
            const filePath = path.join(__dirname, `${i}.json`)
            await fs.writeFileSync(filePath, JSON.stringify(json[i]))
        }
    })
    // console.log('FILE', json.presets)
    // console.log('FILE', json.defaults)

}

run()