const fs = require('fs')

if (require.main !== module) {
    module.exports = {
        name: 'help'
    }
    return
}

let modules = fs.readdirSync(__dirname)
    .filter(scriptName => 
        scriptName[0] != '_' && scriptName != 'help.js')
    .map(scriptName => require('./' + scriptName))
modules.push({name: 'help'})

let printWithTabs = (msg) => 
    console.log('\t'.repeat(printWithTabs.tabsCount) + msg)
printWithTabs.tabsCount = 0

printWithTabs('use npm run <command> -- <argument>=<value>')
printWithTabs('commands list:\n')
modules.forEach(mInfo => {
    if (Object.keys(mInfo).length == 1) {
        printWithTabs(mInfo.name)
        return
    }
    printWithTabs(mInfo.name + ': ' + mInfo.arguments.join(', '))
})


