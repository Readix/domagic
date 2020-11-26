const db = require('../src/db')
const config = require('../src/config.json')
const fs = require('fs')
const path = require('path')
const srcDir = path.join(__dirname, '..')


if (require.main !== module) {
    module.exports = {
        name: 'status'
    }
    return
}

/* Main functions */

let dbConn = async () => {
    return db.init()
        .then(initMsg => true)
        .catch(err => false)
}

let dbSync = async (pluginName) => {
    return db.getPluginsList()
        .then(plugins => {
            return plugins.map(props => props.name)
                .indexOf(pluginName) > -1
        })
        .catch(err => {console.log(err); return false;})
}

let frontExists = async (pluginName) => {
    let filenames = fs.readdirSync(srcDir + '/static/')
    if (filenames.some(name => name == pluginName)) {
        return true 
    }
    return false
}

let backExists = async (pluginName) => {
    let filenames = fs.readdirSync(srcDir + '/src/plugins/')
    if (filenames.some(name => name == (pluginName + '.js'))) {
        return true 
    }
    return false
}

let statuses = {
    commons: {
        'database connection': dbConn
    },
    special: {
        'database sync': dbSync, 
        'frontend': frontExists,
        'backend': backExists
    }
}

let printWithTabs = (msg) => 
    console.log('\t'.repeat(printWithTabs.tabsCount) + msg)
printWithTabs.tabsCount = 0

const colon = (key, val) => key + ': ' + val

let okString = '\x1b[32mok\x1b[0m'
let failString = '\x1b[41mfail\x1b[0m'

let commonsPromises = []
Object.keys(statuses.commons)
    .forEach(testname => {
        let promise = statuses.commons[testname]()
            .then(status => {
                return () => printWithTabs(
                    testname + ': ' + 
                    (status ? okString : failString)
                )
            })
        commonsPromises.push(promise)
    })

let pluginsPromises = []
Promise.all(commonsPromises)
    .then(prints => {
        prints.forEach(print => print())
        config.plugins.forEach(pluginName => {
            pluginsPromises.push(() => {
                printWithTabs(pluginName + ':')
            })
            Object.keys(statuses.special)
                .forEach(testname => {
                    let promise = statuses.special[testname](pluginName)
                        .then(status => {
                            return () => {
                                str = testname + ': ' + 
                                    (status ? okString : failString)
                                printWithTabs.tabsCount += 1
                                printWithTabs(str)
                                printWithTabs.tabsCount -= 1
                            }
                        })
                    pluginsPromises.push(promise)
                })
        })
        Promise.all(pluginsPromises)
        .then(prints => {
            prints.forEach(print => print())
            process.exit()
        })  
    })

