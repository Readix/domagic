const fs = require('fs');
const { DB_PASS } = require('./src/config');
let config = require('./src/config.json')

config['plugins'] = []
// TODO: удалить из базы client_id и client_secret
fs.writeFileSync('./src/config.json', JSON.stringify(config, null, '\t'))
