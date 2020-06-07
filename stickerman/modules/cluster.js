const BaseComponent = require('./bases/baseComponent');
const compose = require('./compose');

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
    split(crit) {
        // crit - пока что только свойство виджета
        this.subs = Object
            .values(
                this.subs.reduce((groups, widget) => {
                    let value = widget.get(crit)
                    groups[value] = groups[value] ? [widget, ...groups[value]] : [widget]
                    return groups
                }, {}))
            .map(group  => new Cluster(group));
    }
    lineUp(crit, desc = false) {
        if (typeof crit === 'undefined') crit = 'x'
        this.subs.sort((sub1, sub2) => {
            return ((-1) ** desc) * (sub1.get(crit) - sub2.get(crit))
        })
        // this.subs.reduce((i, sub) => 
        //     {sub.rank = i; return i + 1}, 0)
        // this.subs.sort((sub1, sub2) => 
        //     ((-1) ** desc) * Number(sub1.rank) - Number(sub2.rank) || sub1 - sub2)
    }
    compose(crit) {
        compose[crit](this.subs)
    }
}

module.exports = Cluster
