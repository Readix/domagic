const BaseComponent = require('./bases/baseComponent');
const compose = require('./compose');
const splitter = require('./splitter')


class Cluster extends BaseComponent {
    constructor(widgets) {
        super()
        this.subs = widgets
    }
    getters() {
        this.getter['x'] = () =>
            Math.min(...this.subs.map(sub => sub.get('x')))
        this.getter['y'] = () => 
            Math.min(...this.subs.map(sub => sub.get('y')))
        this.getter['width'] = () => 
            Math.max(...this.subs.map(sub => sub.get('x') + sub.get('width')))
            - Math.min(...this.subs.map(sub => sub.get('x')))
        this.getter['height'] = () => 
            Math.max(...this.subs.map(sub => sub.get('y') + sub.get('height')))
            - Math.min(...this.subs.map(sub => sub.get('y')))
    }
    setters() {
        this.setter['x'] = x => {
            let dx = x - this.get('x')
            this.subs.forEach(sub => {
                sub.set('x', sub.get('x') + dx)
            })
        }
        this.setter['y'] = y => {
            let dy = y - this.get('y')
            this.subs.forEach(sub => {
                sub.set('y', sub.get('y') + dy)
            })
        }
    }
    async split(crit) {
        // crit - пока что только свойство виджета
        if(crit.startsWith('text'))
            key = crit.split('-')[0]
        else
            key = crit
        this.subs = (await splitter[key](this.subs, crit))
            .map(group  => new Cluster(group));
    }
    lineUp(crit, desc = false) {
        if (typeof crit === 'undefined') crit = 'x'
        this.subs.sort((sub1, sub2) => {
            return ((-1) ** desc) * (sub1.get(crit) - sub2.get(crit))
        })
    }
    compose(crit) {
        compose[crit](this.subs)
    }
}

module.exports = Cluster
