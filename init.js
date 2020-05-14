var fs = require('fs');

//initialization
const keysToConf = ['db_user', 'db_pass', 'base_url', 'api_base', 'plugin_name']
var   keysToDB = {
    "client_id": undefined,
    "client_secret": undefined,
    "plugin_name": undefined
}
let config = fs.readFileSync('./src/config.json')
config = JSON.parse(config)
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
keysToConf.forEach((val, idx, arr) => {
    if((val in config) == false)
        throw new Error(`Missing argument: ${val}`)
})
let setPlugin = false
for (let value in Object.values(keysToDB))
    if(value != undefined)
        setPlugin = true
if(setPlugin)
    for (let [key, value] in Object.entries(keysToDB))
        if(value == undefined)
            throw new Error(`Missing argument: ${key}`)
//save configs
fs.writeFileSync('./src/config.json', JSON.stringify(config))
fs.writeFileSync('./static/web-plugin/config.json', JSON.stringify({host: config['base_url']}))
//save plugin info
process.chdir('/src')
var db = require('db')
db.init()
db.addPlugin(keysToDB.plugin_name, keysToDB.client_id, keysToDB.client_secret).then(()=>{
    console.log("App is initiallized");
})