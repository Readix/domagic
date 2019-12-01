/**
 * Класс для хранения всего контента
 */
content.ContentStorage = class {
    constructor() {
        if (!this.storage) {
            this.storage = [];
        }
    }
    /**
     * Добавить контент в хранилище
     * @param {content.Content} cont Новый контент
     */
    push (cont) {
        for (let i = 0; i < arguments.length; i++) {
            if (arguments[i].toString() != 'content.Content') {
                throw new Error('Invalid type for push in \
                    content storage, must be content.Content');
            }
            this.storage.push(arguments[i]);
        }
    }
    /**
     * Возващает имя типа
     */
    toString () { return "content.ContentStorage"; }
}
