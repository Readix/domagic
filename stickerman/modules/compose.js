const hyper = require('./config')


module.exports = {
    horizontal: subs => {
        subs.reduce((acc, sub, i) => {
            sub.set('y', 0)
            sub.set('x', acc)
            return acc + sub.get('width') * (1 + hyper.indent)  // Неточность в вычислении
        }, 0)
    },
    vertical: subs => {
        subs.reduce((acc, sub, i) => {
            sub.set('y', acc)
            sub.set('x', 0)
            return acc + sub.get('height') * (1 + hyper.indent)  // Неточность в вычислении
        }, 0)
    }
}