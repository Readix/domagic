var fs = require('fs');

let client_id = undefined
let client_secret = undefined
const keysToConf = ['db_user', 'db_pass', 'base_url']
let config = fs.readFileSync('./src/config.json')
config = JSON.parse(config)
process.argv.forEach((val, idx, arr) => {
    let name = val.split('=')[0]
    let value = val.split('=')[1]
    if(keysToConf.indexOf(name) != -1)
        config[name] = value
    else if(name == 'client_id')
        client_id = value
    else if(name == 'client_secret')
        client_secret = value
    else
        throw new Error(`Unexpected argument in input: ${name}`)
})
keysToConf.forEach((val, idx, arr) => {
    if((val in config) == false)
        throw new Error(`Missing argument: ${val}`)
})
fs.writeFileSync('.src/config.json', JSON.stringify(config))
fs.writeFileSync('./static/web-plugin/config.json', JSON.stringify({host: config['base_url']}))

if(client_id == undefined)
    throw new Error('Missing argument: client_id')
if(client_secret == undefined) 
    throw new Error('Missing argument: client_secret')

var db = require('./src/db')
db.init()
await db.addPlugin(client_id, client_secret)
console.log("App is initiallized");