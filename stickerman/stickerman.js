const compose = require('./modules/compose')
const Cluster = require('./modules/cluster');

let output = ws => {
    ws.forEach(w => {
        console.log('Widget:')
        console.log('rank = ', w.rank);
        console.log('color = ', w.get('color'));
        console.log('x = ', w.get('x'), 'y = ', w.get('y'));
        console.log('w = ', w.get('width'), 'h = ', w.get('height'));
    })
}

class Stickerman {
    constructor() {
        this.levels = []
    }
    async run(widgets, criteria) {
        let root = new Cluster(widgets)
        this.levels.push([root])

        for (let i = 0; i < criteria.clustering.length; ++i) {
            this.levels[i + 1] = []
            for(let cluster of this.levels[i]) {
                await cluster.split(criteria.clustering[i])
                this.levels[i + 1].push(...cluster.subs)
            }
        }

        this.levels.reverse()
        this.levels.forEach((level, i) => {
            level.forEach(cluster => {
                cluster.lineUp(criteria.order.values[i], criteria.order.desc)
                cluster.compose(criteria.compose[i])
            })
        })
    }
    getWidgets() {
        let arrays = this.levels[0].map(cluster => cluster.getWidgets())
        return Array.prototype.concat(...arrays)
        // return this.levels[this.levels.length - 1][0].getWidgets()  // recursive from root
    }
}


module.exports = Stickerman