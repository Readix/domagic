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
        let invalidArg = typeof(width) == 'number' && width > 0 ? undefined : width;
        invalidArg = typeof(height) == 'number' && height > 0 ? undefined : height;
        if (invalidArg)
        {
            throw new Error(`Invalid argument ${invalidArg}`);
        }
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
