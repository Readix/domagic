const errh = require('./_errhandler')
const { enablePlugin } = require('./_functions')

const args = ['plugin_name']
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

enablePlugin(values.plugin_name)
    .then(() => {
        console.log(`'${values.plugin_name}' is enabled`)
        process.exit()
    })
    .catch(err => errh.printError(err.message))
