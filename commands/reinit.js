const { exit } = require('process')
const errh = require('./_errhandler')
const { changePluginProps } = require('./_functions')

const args = ['plugin_name', 'client_id', 'client_secret']

if (require.main !== module) {
    module.exports = {
        name: 'reinit (not working)',
        // arguments: args
    }
    return
}

console.log('Not working yet')
exit()

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

changePluginProps(values.plugin_name, values.client_id, values.client_secret)
    .then(() => {
        console.log(`'${values.plugin_name}' properties is updated`)
        process.exit()
    })
    .catch(err => errh.printError(err.message))
