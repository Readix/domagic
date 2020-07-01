const rp = require('request-promise')
const Cluster = require('./cluster')

const textmanUrl = 'http://159.69.37.26:9000'

module.exports = {
    'text': async subs => {
        let inners = subs.map(sub => {
            return {id: sub.get('id'), text: sub.get('text')}})
        console.log(inners)
        let options = {
            method: 'POST',
            uri: textmanUrl + '/split',
            body: JSON.stringify(inners)
        }
        return rp(options)
        .then(groupsOfId => {
            groupsOfId = JSON.parse(groupsOfId)
            console.log('from textman:', groupsOfId)
            return groupsOfId.map(group =>
                group.map(id => 
                    subs.find(sub => 
                        sub.get('id') == id))
            )
        })
        .catch((error) => {
            console.error(error);
            // TODO: log
        })
    },
    'property': async (subs, crit) => {
        return Object
            .values(
                subs.reduce((groups, widget) => {
                    let value = widget.get(crit)
                    groups[value] = groups[value] ? [widget, ...groups[value]] : [widget]
                    return groups
                }, {}))
    }
}
