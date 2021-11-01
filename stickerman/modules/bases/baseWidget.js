const BaseComponent = require('./baseComponent');
const mirolib = require('../mirolib');


class BaseWidget extends BaseComponent {
    constructor(widget) {
        super()
        this.widget = (!widget) ? this.getDefaultWidget() : widget
    }
    getDefaultWidget() {
        return mirolib.sticker.getDefault()
    }
    getters() {
        this.getter['id'] = () => this.widget.id
        this.getter['text'] = () => this.widget.text
        this.getter['color'] = () => this.widget.color
        this.getter['x'] = () => Number(this.widget.x - this.widget.width / 2)
        this.getter['y'] = () => Number(this.widget.y - this.widget.height / 2)
        this.getter['width'] = () => Number(this.widget.width)
        this.getter['height'] = () => Number(this.widget.height)
        this.getter['type'] = () => this.widget.type
        this.getter['size'] = () => (this.height*this.width)
    }
    setters() {
        this.setter['text'] = t => this.widget.text = t
        this.setter['color'] = c => this.widget.color = c
        this.setter['x'] = x => this.widget.x = Number(x) + this.widget.width / 2
        this.setter['y'] = y => this.widget.y = Number(y) + this.widget.height / 2
        this.setter['width'] = w => this.widget.width = Number(w)
        this.setter['height'] = h => this.widget.height = Number(h)
        this.setter['type'] = t => this.widget.type = t
        this.setter['size'] = () => this.widget.size
    }
}

module.exports = BaseWidget
