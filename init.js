const fs = require('fs');
let config = JSON.parse(fs.readFileSync('./src/config.json'))

let instruction = 'use: npm run init -- client_id=... client_secret=... plugin_name=...'

//initialization
const keysToConf = Object.keys(config)
var keysToDB = {
    "plugin_name": undefined,
    "client_id": undefined,
    "client_secret": undefined
}
//read data
process.argv.forEach((val, idx, arr) => {
    let name = val.split('=')[0]
    let value = val.split('=')[1]
    if(keysToConf.indexOf(name) != -1)
        config[name] = value
    if(name in keysToDB)
        keysToDB[name] = value
})
//check data
keysToConf.forEach(key => {
    if (config[key] == ""){
        console.log(`\x1b[31mMissing argument in config.json: ${key}\x1b[0m`)
        process.exit()
    }
})
Object.keys(keysToDB).forEach(key => {
    if (keysToDB[key] == undefined) {
        console.log(`\x1b[31mMissing argument: ${key}\x1b[0m\n` + instruction)
        process.exit()
    }
})
//save configs
fs.writeFileSync('./src/config.json', JSON.stringify(config, null, '\t'))
fs.writeFileSync('./static/web-plugin/config.json', JSON.stringify({host: config['base_url']}))
//save plugin info
var db = require('./src/db')
db.init()
db.addPlugin(keysToDB.plugin_name, keysToDB.client_id, keysToDB.client_secret).then(()=>{
    console.log("App is initiallized:");
    keysToConf.forEach(key => {
        console.log(`${key}=${config[key]}`)
    })
})
