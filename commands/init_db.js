const errh = require('./_errhandler')
const { addDbLogin } = require('./_functions')

const args = ['db_name', 'db_user', 'db_pass']
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

addDbLogin(values.db_name, values.db_user, values.db_pass)
    .then(() => {
        console.log(`database login initialized`)
        process.exit()
    })
    .catch(err => errh.printError(err.message))

