const { builtinModules } = require("module")
const printError = msg => {
    console.error('\x1b[41m' + msg + '\x1b[0m') //\x1b[31m
    process.exit()
}

const unknownArgument = argname => printError('unknown argument ' + argname)

module.exports = {
    printError: printError,
    unknownArgument: unknownArgument
}