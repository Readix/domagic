const hyper = require('./config')

const rectCoef = 2 / 3 // w / h
module.exports = {
    horizontal: subs => {
        let cy = Math.max(...subs.map(sub => sub.get('height'))) / 2
        subs.reduce((acc, sub, i) => {
            sub.set('y', cy - sub.get('height') / 2)
            sub.set('x', acc)
            return acc + sub.get('width') * (1 + hyper.indent)  // Неточность в вычислении
        }, 0)
    },
    vertical: subs => {
        let shift = hyper.indent * Math.max(...subs.map(sub => sub.get('height')))
        let cx = Math.max(...subs.map(sub => sub.get('width'))) / 2
        subs.reduce((acc, sub, i) => {
            sub.set('y', acc)
            sub.set('x', cx - sub.get('width') / 2)
            return acc + sub.get('height') + shift// * (1 + hyper.indent)  // Неточность в вычислении
        }, 0)
    },
    blocky: subs => {
        let w = Math.sqrt(rectCoef * subs.length)
        let h = subs.length / w
        let cntr = 0
        let sumHeight = 0
        for (let i = 0; i < h; i++) {
            let lineHeight = 0
            let xShift = 0
            for (let j = 0; j < w; j++) {
                lineHeight = Math.max(lineHeight, subs[cntr].get('height'))
                subs[cntr].set('y', sumHeight)
                subs[cntr].set('x', xShift)
                xShift += subs[cntr].get('width') * (1 + hyper.indent)
                cntr++
                if (cntr == subs.length) return
            }
            sumHeight += lineHeight * (1 + hyper.indent)
        }
    }
}