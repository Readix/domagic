/**
 * Класс элемента макета
 */
layout.Element = class {
    /**
     * Создает элемент макета  
     * Для создании копии объекта передайте
     * объект типа content.Element 
     * @param {number} x 
     * @param {number} y
     * @param {content.Content} cont
     */
    constructor (x, y, cont) {
        if (content.toString() != 'content.Content') {
            throw new Error('Invalid content type for create Element, must be content.Content');
        }
        let checkArg = a => {
            if (typeof(a) != 'number' || a < 0) {
                throw new Error(`Invalid argument ${a} for create Element`);
            }
        }
        checkArg(x);
        checkArg(y);
        this.x = x;
        this.y = y;
        this.content = cont;
    }
    /**
     * Сравнивает два элемента
     * @param {layout.Element} element1 
     * @param {layout.Element} element2 
     * @returns true, если элементы равны, false - в противном случае 
     */
    static equal (element1, element2) {
        if (element1.content != element2.content) {
            return false;
        }
        if (element1.x != element2.x || element1.y != element2.y) {
            return false;
        }
        return true;
    }

    /**
     * Создает копию элемента
     * @param {layout.Element} element Копируемый элемент
     * @returns Новый элемент-копию 
     */
    static copy (element) {
        if (element.toString() != 'layout.Element') {
            throw new Error('Invalid type for copy Element');
        }
        e = new content.Element(element.x, element.y, element.content);
        return e;
    }
    /**
     * Возващает имя типа
     */
    toString () { return 'layout.Element'; }
}
