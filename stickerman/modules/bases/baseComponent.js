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
        try {
            return this.getter[propname](...args)  // catch
        } catch (error) {
            console.error('property "' + propname + '" not found in getter')
        }
    }
    set(propname, ...args) {
        try {
            this.setter[propname](...args)  // catch
            return this
        } catch (error) {
            console.error('property "' + propname + '" not found in setter')
        }
    }
}

module.exports = BaseComponent
