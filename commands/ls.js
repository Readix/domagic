const config = require('../src/config.json')
const {getPluginsList} = require('./_functions')


if (require.main !== module) {
    module.exports = {
        name: 'ls'
    }
    return
}

const printWithTabs = (msg, tabsCount) => 
    console.log('\t'.repeat(tabsCount) + msg)

const colon = (key, val) => key + ': ' + val

console.log('database:')
printWithTabs(colon('db_name', config['db_name']), 1)
printWithTabs(colon('db_user', config['db_user']), 1)
printWithTabs(colon('db_pass', config['db_pass']), 1)

getPluginsList().then(list => {
    list.forEach(props => {
        console.log(props.name + ':')
        printWithTabs(colon(
            'status', 
            config['plugins'].indexOf(props.name) < 0 ? 'disabled' : 'enabled'), 1)
        printWithTabs(colon('client_id', props.client_id), 1)
        printWithTabs(colon('client_secret', props.client_secret), 1)
    })
    process.exit()
})


