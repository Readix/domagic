/**
 * Класс области
 */
layout.Area = class {
    /**
     * Создает область
     * @param {layout.Meta} meta Мета-информация области
     */
    constructor (meta) {
        if (meta.toString() != 'layout.Meta') {
            throw new Error('Invalid argument type for create Area, must be layout.Meta');
        }
        this.meta = meta;
    }
    /**
     * Возващает имя типа
     */
    toString () { return 'layout.Area'; }
}
