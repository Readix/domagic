/**
 * Класс контента
 */
content.Content = class {
        /**
         * Создает объект некоторого контента
         * @param {string} type Тип контента
         * @param {content.Meta} meta Размер контента
         */
        constructor(type, meta) {
            if (!(type in content.contentTypes)) {
                throw new Error(`Content type ${type} not found`);
            }
            if (meta.toString() != 'content.Meta') {
                throw new Error('Invalid meta type');
            }
            this.type = type;
            this.meta = meta;
            this.id = ++content.Content.lastId;
        }
        /**
         * Возващает имя типа
         */
        toString () { return "content.Content"; }
}
content.Content.lastId = -1;
