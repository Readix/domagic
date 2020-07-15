const BaseComponent = require('./baseComponent');


class BaseWidget extends BaseComponent {
    constructor(widget) {
        super()
        this.widget = widget
    }
}

module.exports = BaseWidget
