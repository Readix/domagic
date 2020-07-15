const rp = require('request-promise')
const Cluster = require('./cluster')

let dist = (a, b) => Math.abs(a - b)

async function by_property(subs, crit) {
    if(crit == 'size'){
        let values = subs.map(sub => sub.widget.height*sub.widget.width)
        let diffs = []
        values.slice(0, values.length - 1).forEach((a, i) => {
            values.slice(i + 1).forEach(b => {
                diffs.push(dist(a, b))
            })
        })
        let uniqueSort = diffs
            .filter((e, i) => diffs.indexOf(e) == i)
            .sort()
        let middle = Math.floor(uniqueSort.length / 2)
        let median = uniqueSort.length % 2 ? uniqueSort[middle] :
            (uniqueSort[middle] + uniqueSort[middle - 1]) / 2
        let min = Math.min(...values)
        let normalized = values.map(e => e - min)
        return Object
            .values(
                normalized.reduce((acc, e, i) => {
                    let group = Math.floor(e / median)
                    acc[group] =  acc[group] ? [...acc[group], subs[i]] : [subs[i]]
                    return acc
                }, {}))
    }else
        return Object
            .values(
                subs.reduce((groups, widget) => {
                    let value = widget.get(crit)
                    groups[value] = groups[value] ? [widget, ...groups[value]] : [widget]
                    return groups
                }, {}))
}

module.exports = {
    'size': by_property,
    'color': by_property
}
