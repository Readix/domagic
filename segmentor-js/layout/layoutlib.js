require('module-alias/register');
const content = require('@libs/content/contentlib');

var layout = {};


layout.Meta = class {
    /**
     * Создает объект с мета-информацией об объекте макета 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    constructor (x, y, width, height) {
        if (arguments.length < 1) {
            return;
        }
        let valid = a => {
            if (typeof(a) != 'number' || a < 0) {
                throw new Error(`Invalid argument ${a} for create layout Meta`);
            }
        }
        valid(x);
        valid(y);
        valid(width);
        valid(height);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    /**
     * Возващает имя типа
     */
    toString () { return 'layout.Meta'; }
}

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
        if (cont.toString() != 'content.Content') {
            throw new Error(`Invalid content type ${cont.toString()} 
                for create Element, must be content.Content`);
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
        if (element1.content.id != element2.content.id) {
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
        let e = new layout.Element(element.x, element.y, element.content);
        return e;
    }
    /**
     * Возващает имя типа
     */
    toString () { return 'layout.Element'; }
}

/**
 * Класс макета с элементами
 */
layout.Maket = class {
    /**
     * Создает объект макета
     */
    constructor () {
        this.elements = [];
    }
    /**
     * Помещает элемент на макет
     * @param {layout.Element} element Новый элемент 
     */
    push (element) {
        if (element.toString() != 'layout.Element') {
            throw new Error('Invalid element type for push in maket');
        }
        for (let i_myElement in this.elements) {
            let myElement = this.elements[i_myElement];
            if (myElement == element) {
                return false;
            }
        }
        this.elements.push(element);
        return true;
    }
    /**
     * Проверяет, содержится ли данный контент на макете
     * @param {content.Content} cont
     * @returns true если содержится, false - в противном случае
     */
    contains (cont) {
        for (let i_myElement in this.elements) {
            let myElement = this.elements[i_myElement];
            if (myElement.content.id == cont.id) {
                return true;
            }
        }
        return false;
    }
    /**
     * Сравнивает два макета
     * @param {layout.Maket} maket1
     * @param {layout.Maket} maket2
     * @returns true, если макеты равны, false - в противном случае
     */
    static equal (maket1, maket2) {
        for (let i1 in maket1.elements) {
            let found = false;
            for (let i2 in maket2.elements) {
                if (layout.Element.equal(maket1.elements[i1], maket2.elements[i2])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    }
    /**
     * Создает копию макета
     * @param {layout.Maket} maket Копируемый макет
     * @returns Новый макет-копию
     */
    static copy (maket) {
        if (maket.toString() != 'layout.Maket') {
            throw new Error('Invalid type for copy maket');
        }
        let newMaket = new layout.Maket();
        maket.elements.forEach(element => {
            newMaket.elements.push(layout.Element.copy(element)); 
        });
        return newMaket;
    }
    size () {
        let xmin = 0, ymin = 0, xmax = 0, ymax = 0;
        for (i in this.elements) {
            xmin = Math.max(this.elements[i].x, xmin);
            ymin = Math.max(this.elements[i].y, ymin);
            xmax = Math.max(this.elements[i].x + this.elements[i].content.meta.width, xmax);
            ymax = Math.max(this.elements[i].x + this.elements[i].content.meta.height, ymax);
        }

        return {width:xmax - xmin, height:ymax - ymin};
    }
    /**
     * Возващает имя типа
     */
    toString () { return 'layout.Maket'; }
}

module.exports = layout;