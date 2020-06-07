const BaseWidget = require('./modules/bases/baseWidget');


class MiroWidget extends BaseWidget  {
    constructor(widget) {
        super(widget)
    }
    getters() {
        this.getter['color'] = () => this.widget.style.stickerBackgroundColor
        this.getter['x'] = () => Number(this.widget.x - this.widget.bounds.width / 2)
        this.getter['y'] = () => Number(this.widget.y - this.widget.bounds.height / 2)
        this.getter['width'] = () => Number(this.widget.bounds.width)
        this.getter['height'] = () => Number(this.widget.bounds.height)
        this.getter['tag'] = () => this.widget.tags[0]
    }
    setters() {
        this.setter['color'] = c => this.widget.style.stickerBackgroundColor = c
        this.setter['x'] = x => this.widget.x = Number(x) + this.widget.bounds.width / 2
        this.setter['y'] = y => this.widget.y = Number(y) + this.widget.bounds.height / 2
        this.setter['width'] = w => this.widget.bounds.width = Number(w)
        this.setter['height'] = h => this.widget.bounds.height = Number(h)
        //this.getter['tag'] = tag => this.widget.tags[0] = tag
    }
}

module.exports = MiroWidget
