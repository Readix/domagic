const rp = require('request-promise')
const Cluster = require('./cluster')
const logger = require('../../src/logger')
const { InternalServerError } = require('http-errors')
const { RequestError } = require('request-promise/errors')
const BaseWidget = require('./bases/baseWidget')
const mirolib = require('./mirolib')

const textmanUrl = 'http://localhost:8001'

let dist = (a, b) => Math.abs(a - b)

// for keyword clustering
let colorsFor = {
    undefined: mirolib.sticker.colors.all[0],
    clusters: mirolib.sticker.colors.all.slice(1, -1)
}

function score_tonality(subs, _) {
    let inners = subs.map(sub => {
        return {id: sub.get('id'), text: sub.get('text')}
    })
    // console.log(inners)
    let options = {
        method: 'POST',
        uri: textmanUrl + '/binary_ton',
        body: JSON.stringify(inners)
    }
    return rp(options)
    .then(options => {
        options = JSON.parse(options)
        if (options.error){
            logger.error(options.data)
            throw RequestError()
        }
        // console.log('from textTonality:', options.data)
        search_sub = function(group) {
            return group.map(id =>
                subs.find(sub => sub.get('id') == id)
            )
        }
        return [
            search_sub(options.data['positive']).map(sub => sub.set('color', '#91fd5e')),
            search_sub(options.data['negative']).map(sub => sub.set('color', '#fd404a')),
            search_sub(options.data['indefinite']).map(sub => sub.set('color', '#c1d3fd'))
        ]
    })
}

function choose_text_method(meth) {
    return async function(subs, crit) {
        if(crit.search('-') != -1)
            countGroups = parseInt(crit.split('-')[1])
        else
            countGroups = undefined
        let inners = subs.map(sub => {
            return {id: sub.get('id'), text: sub.get('text')}
        })
        // console.log(inners, 'groups:', countGroups)
        let options = {
            method: 'POST',
            uri: textmanUrl + meth,
            body: JSON.stringify({
                widgets: inners,
                count_groups: countGroups
            })
        }
        return rp(options)
        .then(options => {
            if (options.error){
                logger.error(options.data)
                throw RequestError()
            }
            groupsOfId = JSON.parse(options.data)
            // console.log('from textman:', groupsOfId)
            return groupsOfId.map(group =>
                group.map(id =>
                    subs.find(sub => sub.get('id') == id)
                )
            )
        })
    }
}

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

function keywords(subs, _) {
    let inners = subs.map(sub => {
        return {id: sub.get('id'), text: sub.get('text')}
    })
    let options = {
        method: 'POST',
        uri: textmanUrl + '/by_keywords',
        body: JSON.stringify(inners)
    }
    return rp(options)
        .then(options => {
            options = JSON.parse(options)
            if (options.error){
                logger.error(options.data)
                throw RequestError('Request /by_keywords failed with error')
            }
            // console.log('from /by_keywords:', options.data)
            let colorCounter = 0
            let createKeygroup = (keywordCluster, color) => {
                if (!color) color = colorsFor.clusters[colorCounter % colorsFor.clusters.length]
                keyWidget = new BaseWidget()
                keyWidget.set('type', 'sticker')
                keyWidget.set('color', color)
                keyWidget.set('text', keywordCluster['key'])
                cluster = keywordCluster['data'].map(id => {
                    sub = subs.find(sub => sub.get('id') == id)
                    sub.set('color', color)
                    return sub
                })
                colorCounter++
                res = [keyWidget, ...cluster]
                return res
            }
            let clusters = options.data['clusters'].map(keywordCluster => {
                return createKeygroup(keywordCluster)
            })
            if (options.data['undefined'].length != 0) {
                clusters = [
                    createKeygroup({key: 'undefined', data: options.data['undefined']}, colorsFor.undefined),
                    ...clusters
                ]
            }
            return clusters
        })
}

module.exports = {
    'text1': choose_text_method('/split_dbscum'),
    'text2': choose_text_method('/split_birch'),
    'text3': choose_text_method('/split_kmeans'),
    'tonality': score_tonality,
    'keywords': keywords,
    'size': by_property,
    'color': by_property
}
