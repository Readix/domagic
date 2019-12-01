/**
 * Набор методов для работы с различными вычислениями
 */
cutter.Calculator = {
    /**
     * Словарь функций сравнения контента
     */
    compares: {
        /** Сравнение по площади */
        square: (content1, content2) => {
            cutter.valid(content1, 'content.Content');
            cutter.valid(content2, 'content.Content');
            return content1.meta.square > content2.meta.square;
        },
        /** Сравнение по длине */
        width: (content1, content2) => {
            cutter.valid(content1, 'content.Content');
            cutter.valid(content2, 'content.Content');
            return content1.meta.width > content2.meta.width;
        },
        /** Сравнение по высоте */
        height: (content1, content2) => {
            cutter.valid(content1, 'content.Content');
            cutter.valid(content2, 'content.Content');
            return content1.meta.height > content2.meta.height;
        }
    },
    /**
     * Сортирует массив контента
     * используя compare
     * @param {array} contents
     * @param {string} compare
     * @returns Отсортированный массив с контентом
     */
    sortContents: (contents, compare) => {
        for (i in contents) {
            if (contents[i].toString() != 'content.Content') {
                throw new Error(`Invalid object type ${contents[i].toString()}` +
                    ' in array to sort, must be content.Content');
            }
        }
        if (!(compare in cutter.Calculators.compares)) {
            throw new Error(`Not found compare function named \
                ${compare} in calculator compares`);
        }
        return contents.sort(cutter.Calculator.compares[compare]);
    },
    /**
     * Проверяет, помещается ли контент в область
     * @param {content.Content} cont Контент
     * @param {layout.Area} area Область для размещения
     * @param {number} align Отступ вокруг контента
     * @returns true если контент помещается, false - 
     * в противном случае
     */
    suit: (cont, area, align = 0) => {
        if (cont.toString() != 'content.Content') {
            throw new Error(`Invalid type ${cont.toString()}\
                for suit function, must be content.Content`);
        }
        if (area.toString() != 'layout.Area') {
            throw new Error(`Invalid type ${area.toString()}\
                for suit function, must be layout.Area`);
        }
        if (typeof(align) != 'number') {
            throw new Error(`Invalid align type \
                ${typeof(align)}, must be number`);
        }
        return (cont.meta.width + 2 * align <= area.meta.width) &&
            (cont.meta.height + 2 * align <= area.meta.height);
    }
}