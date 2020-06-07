const compose = require('./modules/compose')
const Cluster = require('./modules/cluster');
//
let output = ws => {
    ws.forEach(w => {
        console.log('Widget:')
        console.log('rank = ', w.rank);
        console.log('color = ', w.get('color'));
        console.log('x = ', w.get('x'), 'y = ', w.get('y'));
        console.log('w = ', w.get('width'), 'h = ', w.get('height'));
    })
}
//
class Stickerman {
    constructor() {
        this.levels = []
    }
    run(widgets, criteria) {
        // criteria = {clustering: ['color'], order: ['sizeUp'], compose: ['horizontal', ...]}
        let root = new Cluster(widgets)
        this.levels.push([root])
        criteria.clustering.forEach((crit, i) => {
            this.levels[i + 1] = []
            this.levels[i].forEach(cluster => {
                cluster.split(crit)
                this.levels[i + 1].push(...cluster.subs)
            })
        })
        this.levels.reverse()
        this.levels.forEach((level, i) => {
            level.forEach(cluster => {
                cluster.lineUp(criteria.order.values[i], criteria.order.desc)
            })
        })
        this.levels.forEach((level, i) => {
            level.forEach(cluster => {
                cluster.compose(criteria.compose[i])
            })
        })
    }
}


module.exports = Stickerman

/*
function ebash(widgets, crits) {
//want
    let c = new Cluster(widgets)
    Cluster.split('color')
    //for c in cluster.clusters c.split('size')
    for i, crit in crits: 
        Ranker.layer(i).split(crit)
//real
}

function GetRecommendation(subs) {  // sub - cluster or widget
    ...
    return {'vertical': 0.8, 'vRect': 0,7}  // evaluating of the suitable composes
}
conf = {
    'color': ['-child'],
    'width': ['vertical', 'vRect'],
    'height': ['horizontal', 'hRect'],

}*/