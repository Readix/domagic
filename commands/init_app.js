const errh = require('./_errhandler')
const config = require('../src/config.json')
const { addPlugin, enablePlugin } = require('./_functions')

const args = ['plugin_name', 'client_id', 'client_secret', 'is_paid']

if (require.main !== module) {
    module.exports = {
        name: 'init_app',
        arguments: args
    }
    return
}

const values = args.reduce((acc, val) => {
    acc[val] = undefined; return acc}, {})

process.argv.slice(2).forEach((val, idx, arr) => {
    let name = val.split('=')[0]
    let value = val.split('=')[1]
    if (args.indexOf(name) < 0) {
        errh.unknownArgument(name)
        return
    }
    values[name] = value
})

addPlugin(values.plugin_name, values.client_id, values.client_secret, values.is_paid)
    .then(() => {
        console.log(`plugin '${values.plugin_name}' is added in database '${config.db_name}'`)
        enablePlugin(values.plugin_name)
            .then(() => {
                console.log(`plugin '${values.plugin_name}' is enabled`)
                process.exit()
            })
            .catch(err => errh.printError(err.message))
    })
    .catch(err => errh.printError(err.message))

