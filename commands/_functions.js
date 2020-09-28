const db = require('../src/db')
const fs = require('fs')
const srcDir = __dirname + '/..'

/*Inside functions*/

const error = {
    expectedArg: (argname) => {throw Error('Expected argument: ' + argname)}
}

const pluginFrontendExists = (pluginName) => {
    let filenames = fs.readdirSync(srcDir + './static/')
    if (filenames.some(name => name == pluginName)) {
        return true 
    }
    return false
}

/*Outside functions*/

const addPlugin = async (pluginName, clientId, clientSecret) => {
    if (!pluginName) {
        error.expectedArg('plugin_name')
    }
    if (!clientId || !clientSecret) {
        error.expectedArg(clientId ? 'client_secret':'client_id')
    }
    if (!pluginFrontendExists(pluginName)) {
        throw Error(`Folder for plugin '${pluginName}' does not exists in static/`)
    }
    await db.init()
    console.log(srcDir);
    return db.addPlugin(pluginName, clientId, clientSecret, srcDir)
}

const removePlugin = async (pluginName) => {
    if (!pluginName) {
        error.expectedArg('plugin_name')
    }
    await db.init()
    return db.deletePlugin(pluginName, srcDir)
}

const changePluginProps = async (pluginName, clientId, clientSecret) => {
    if (!pluginName) {
        error.expectedArg('plugin_name')
    }
    await db.init()
    return db.changePluginProps(pluginName, clientId, clientSecret, srcDir)
}

const enablePlugin = async (pluginName) => {
    if (!pluginName) {
        error.expectedArg('plugin_name')
    }
    await db.init()
    return db.pluginExists(pluginName, srcDir).then(exists => {
        let config = require('../src/config.json')
        if (!exists) {
            throw Error(`plugin '${pluginName}' does not exists in database ${config.db_name}`)
        }
        if (!pluginFrontendExists(pluginName)) {
            throw Error(`folder for plugin '${pluginName}' does not exists in static/`)
        }
        if (config['plugins'].indexOf(pluginName) < 0) {
            config['plugins'].push(pluginName)
            fs.writeFileSync(srcDir + './src/config.json', JSON.stringify(config, null, '\t'))
        }
    })
}

const disablePlugin = async (pluginName) => {
    if (!pluginName) {
        error.expectedArg('plugin_name')
    }
    let config = require('../src/config.json')
    let index = config['plugins'].indexOf(pluginName)
    if (index > -1) {
        config['plugins'].splice(index, 1)
        fs.writeFileSync(srcDir + '/src/config.json', JSON.stringify(config, null, '\t'))
    }
}

const addDbLogin = async (dbName, dbUser, dbPass) => {
    let config = require('../src/config.json')
    config['db_name'] = dbName
    config['db_user'] = dbUser
    config['db_pass'] = dbPass
    fs.writeFileSync(srcDir + './src/config.json', JSON.stringify(config, null, '\t'))
    return db.init()
}

const getPluginsList = async () => {
    await db.init()
    return db.getPluginsList(srcDir)
}

const writeConfigField = async (key, value) => {
    let config = require('../src/config.json')
    config[key] = value
    fs.writeFileSync(srcDir + '/src/config.json', JSON.stringify(config, null, '\t'))
}

module.exports = {
    addPlugin: addPlugin,
    removePlugin: removePlugin,
    changePluginProps: changePluginProps,
    enablePlugin: enablePlugin,
    disablePlugin: disablePlugin,
    addDbLogin: addDbLogin,
    getPluginsList: getPluginsList,
    writeConfigField: writeConfigField
}
