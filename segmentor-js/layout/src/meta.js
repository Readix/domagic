layout.Meta = class {
    /**
     * Создает объект с мета-информацией об объекте макета 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    constructor (x, y, width, height) {
        let valid = a => {
            if (typeof(a) != 'number' || a <= 0) {
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
