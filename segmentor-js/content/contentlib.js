var content = {}


/**
 * Массив уникальных типов контента
 */
content.contentTypes = {
    IMAGE: 'IMAGE',
    ONESTRTEXT: 'ONESTRTEXT',
    TEXTBLOCK: 'TEXTBLOCK'
}

/**
 * Класс мета-информации контента
 */
content.Meta = class {
    /**
     * Создает объект с информацией о размере
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        let valid = a => {
            if (typeof(a) != 'number' || a <= 0) {
                throw new Error(`Invalid argument ${a}`);
            }
        }
        valid(width);
        valid(height);
        this.width = width;
        this.height = height;
    }
    /**
     * Вычисляет площадь области
     */
    get square () {
        return this.width * this.height;
    }
    /**
     * Возващает имя типа
     */
    toString () { return "content.Meta"; } 
}

/**
 * Класс контента
 */
content.Content = class {
        /**
         * Создает объект некоторого контента
         * @param {string} type Тип контента
         * @param {content.Meta} meta Размер контента
         * @param {any} id id
         */
        constructor(type, meta, id) {
            if (!(type in content.contentTypes)) {
                throw new Error(`Content type ${type} not found`);
            }
            if (meta.toString() != 'content.Meta') {
                throw new Error('Invalid meta type');
            }
            this.type = type;
            this.meta = meta;
            this.id = id;
        }
        /**
         * Возващает имя типа
         */
        toString () { return "content.Content"; }
}

/**
 * Класс для хранения всего контента
 */
content.ContentStorage = class {
    constructor() {
        this.storage = [];
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

module.exports = content