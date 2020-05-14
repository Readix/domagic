var fs = require('fs')

let content = fs.readFileSync('config.json')
content = JSON.parse(content)

module.exports.API_BASE     = content['api_base']
module.exports.BASE_URL     = content['base_url']
module.exports.DB_USER      = content['db_user']
module.exports.DB_PASS      = content['db_pass']
module.exports.PLUGIN_NAME  = content['plugin_name']