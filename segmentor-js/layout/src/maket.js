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
        for (myElement in this.elements) {
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
        for (myElement in this.elements) {
            if (myElement.content == cont) {
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
        for (i1 in maket1.elements) {
            found = false;
            for (i2 in maket2.elements) {
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
    copy (maket) {
        if (maket.toString() != 'layout.Maket') {
            throw new Error('Invalid type for copy maket');
        }
        maket.elements.forEach(element => {
           this.elements.push(new layout.Element(element)); 
        });
    }
    /**
     * Возващает имя типа
     */
    toString () { return 'layout.Maket'; }
}
