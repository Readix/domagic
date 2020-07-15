const BaseWidget = require('./bases/baseWidget')

/*
    Реализует обертку над 
    виджетом с одним уровнем вложенности ключей
*/
class SimpleWidget extends BaseWidget {
    constructor(widget) {
        super(widget)
    }
    getters(){
        this.getter['id'] = () => this.widget.id
        this.getter['text'] = () => this.widget.text
    }
    setters(){
        this.setter['id'] = id => this.widget.id = id
        this.setter['text'] = text => this.widget.text = text
    }
}

module.exports = SimpleWidget