const errh = require('./_errhandler')
const { writeConfigField } = require('./_functions')

const args = ['base_url', 'port']

if (require.main !== module) {
    module.exports = {
        name: 'set',
        arguments: args
    }
    return
}

let notAccess = ['api_base', 'plugins']
let values = {}

process.argv.slice(2).forEach((val, idx, arr) => {
    let name = val.split('=')[0]
    let value = val.split('=')[1]
    if (notAccess.indexOf(name) >= 0) {
        errh.printError(`set function cannot overwrite '${name}' field`)
    }
    if (args.indexOf(name) < 0) {
        errh.unknownArgument(name)
    }
    values[name] = value
})

Object.keys(values).forEach(key => {
    writeConfigField(key, values[key])
        .catch(err => errh.printError(err.message))
})
