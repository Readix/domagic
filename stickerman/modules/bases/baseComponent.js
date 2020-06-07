class BaseComponent {
    constructor() {
        this.getter = {}
        this.setter = {}
        try {
            this.getters()
            this.setters()
        } catch (error) {
            if (error.name == 'TypeError') {
                throw new Error('Not implemented abstract function\
                    from the BaseComponent class\n' + error)
            }
            else throw error
        }
    }
    get(propname, ...args) {
        return this.getter[propname](...args)  // catch
    }
    set(propname, ...args) {
        this.setter[propname](...args)  // catch
    }
}

module.exports = BaseComponent
