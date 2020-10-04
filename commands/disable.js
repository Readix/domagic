const errh = require('./_errhandler')
const { disablePlugin } = require('./_functions')

const args = ['plugin_name']

if (require.main !== module) {
    module.exports = {
        name: 'disable',
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

disablePlugin(values.plugin_name)
    .then(() => {
        console.log(`'${values.plugin_name}' is disabled`)
        process.exit()
    })
    .catch(err => errh.printError(err.message))
