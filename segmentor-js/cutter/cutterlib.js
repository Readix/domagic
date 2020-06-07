require('module-alias/register');
const content = require('@libs/content/contentlib');
const layout = require('@libs/layout/layoutlib');

var cutter = {}

cutter.valid = (object, type, msg = '') => {
    defaultTypes = ['number', 'string', 'boolean', 'undefined'];
    if (defaultTypes.indexOf(type) >= 0) {
        if (typeof(object) != type) {
            throw new Error(msg || `Invalid type ${typeof(object)}, must be ${type}`);
        }
        return;
    }
    if (object.toString() != type) {
        throw new Error(msg || `Invalid type ${object.toString()}, must be ${type}`);
    }
}


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
            return content1.meta.square < content2.meta.square;
        },
        /** Сравнение по длине */
        width: (content1, content2) => {
            cutter.valid(content1, 'content.Content');
            cutter.valid(content2, 'content.Content');
            return content1.meta.width < content2.meta.width;
        },
        /** Сравнение по высоте */
        height: (content1, content2) => {
            cutter.valid(content1, 'content.Content');
            cutter.valid(content2, 'content.Content');
            return content1.meta.height < content2.meta.height;
        },
        /** Сравнение по длине */
        custom: (content1, content2) => {
            cutter.valid(content1, 'content.Content');
            cutter.valid(content2, 'content.Content');
            // return content1.meta.width < content2.meta.width;
            if (content1.type == 'TEXT') return false;
            else return true;
        },
        byType: (content1, content2) => {
            cutter.valid(content1, 'content.Content');
            cutter.valid(content2, 'content.Content');
            let isType = (cont, type) => {
				return cont.type.toLowerCase() == content.contentTypes[type].toLowerCase();
            }
            if (isType(content1, 'TEXT') && isType(content2, 'TEXT')) {
				return content1.meta.height - content2.meta.height;
            }
            if (!isType(content1, 'TEXT') && !isType(content2, 'TEXT')) {
				return content1.meta.width - content2.meta.width;
            }
			if (isType(content1, 'TEXT')) {
				return -1;
			}
			return 1;
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
        for (let i in contents) {
            if (contents[i].toString() != 'content.Content') {
                throw new Error(`Invalid object type ${contents[i].toString()}` +
                    ' in array to sort, must be content.Content');
            }
        }
        if (!(compare in cutter.Calculator.compares)) {
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
cutter.Cutter = class {
    /**
     * Создает объект сегментатора
     */
    constructor (contents) {
        this.align = 0;
        this.toPaste = [];
        this.toSplit = [];
        this.Batch = class {
            constructor () {
                this.maket = undefined;
                this.areas = [];
            }
        };
        this.Segment = class {
            constructor () {
                this.content = undefined;
                this.area = undefined;
            }
        };
        this.Pair = class {
            constructor () {
                this.batch = undefined;
                this.segment = undefined;
            }
        };
        this.contents = cutter.Calculator.sortContents(contents, 'byType');
        this.makets = [];
    }
    /**
     * Запускает алгоритм размещения
     * @param {layout.area} area Исходная область
     * @param {number} align Отступ вокруг элементов
     */
    segmente (area, align = 0) {
        cutter.valid(area, 'layout.Area');
        cutter.valid(align, 'number');
        this.align = align;

        let batch = new this.Batch();
        batch.areas.push(area);
        batch.maket = new layout.Maket();
        this.toPaste.push(batch);

        while (this.toPaste.length || this.toSplit.length) {
            if (this.toPaste.length)
                this.pasteIteration();
            if (this.toSplit.length)
                this.splitIteration();
        }
    }
    /**
     * Реализует выборку контента
     * для вставки в очередной макет 
     */
    pasteIteration () {
        let batch = this.toPaste.pop();

        for (let i_area in batch.areas) {
            let area = batch.areas[i_area];
            let choose = false; 
            for (let i_cont in this.contents) {
                let cont = this.contents[i_cont];
                if (!this.relevant(batch.maket, area, cont)) {
                    continue;
                }
                choose = true;
                let newBatch = new this.Batch();
                newBatch.maket = layout.Maket.copy(batch.maket);
                for (let i in batch.areas) {
                    newBatch.areas.push(batch.areas[i]);
                }
                let segment = new this.Segment();
                segment.content = cont;
                segment.area = area;
                let pair = new this.Pair();
                pair.batch = newBatch;
                pair.segment = segment;
                this.toSplit.push(pair);
                // break;
            }
            if (choose) return;
        }
    }
    /**
     * Реализует итерацию разбиения очередной
     * области из "toSplit" и обновляет стек "toPaste"
     */
    splitIteration () {
        let pair = this.toSplit.pop();
        let batch = pair.batch;
        let segment = pair.segment;

        let cont = segment.content;
        let area = segment.area;
        
        let index = batch.areas.indexOf(area);
        if ( index < 0 ) {
            console.log('area not found :(');
            return;
        }
        batch.areas.splice(index, 1);

        let areaMeta = area.meta;
        let element = new layout.Element(
            areaMeta.x + this.align,
            areaMeta.y + this.align,
            cont
        );
        batch.maket.push(element);

        if (batch.maket.elements.length == this.contents.length) {
            this.makets.push(batch.maket);
            return;
        }

        let contentMeta = cont.meta;
        let areaRightMeta = new layout.Meta();
        let areaBottomMeta = new layout.Meta();

        this.cut('MODE_V', areaMeta, contentMeta, areaRightMeta, areaBottomMeta);
        this.updateBatches(batch, areaRightMeta, areaBottomMeta);

        this.cut('MODE_H', areaMeta, contentMeta, areaRightMeta, areaBottomMeta);
        this.updateBatches(batch, areaRightMeta, areaBottomMeta);
    }
    /**
     * Разрезает исходную область `areaMeta` способом `mode`,
     * с учетом размещения контента с мета-информацией `contentMeta`,
     * и помещает данные о полученных областях
     * в `areaRightMeta` и `areaBottomMeta`
     * @param {string} mode Способ разреза
     * @param {layout.Meta} areaMeta Мета-информация исходной области
     * @param {content.Meta} contentMeta Мета-информация контента
     * @param {layout.Meta} areaRightMeta Мета-информация правой части
     * @param {layout.Meta} areaBottomMeta Мета-информация нижней части
     */
    cut (mode, areaMeta, contentMeta, areaRightMeta, areaBottomMeta) {
        cutter.valid(mode, 'string');
        cutter.valid(contentMeta, 'content.Meta');
        cutter.valid(areaRightMeta, 'layout.Meta');
        cutter.valid(areaBottomMeta, 'layout.Meta');

        if (mode == 'MODE_V') {
            areaRightMeta.x =       areaMeta.x + this.align * 2 + contentMeta.width;
            areaRightMeta.y =       areaMeta.y;
            areaRightMeta.width =   areaMeta.width - this.align * 2 - contentMeta.width;
            areaRightMeta.height =  areaMeta.height;

            areaBottomMeta.x =      areaMeta.x;
            areaBottomMeta.y =      areaMeta.y + this.align * 2 + contentMeta.height;
            areaBottomMeta.width =  this.align * 2 + contentMeta.width;
            areaBottomMeta.height = areaMeta.height - this.align * 2 - contentMeta.height;
        } 
        else if (mode == 'MODE_H') {
            areaRightMeta.x =       areaMeta.x + this.align * 2 + contentMeta.width;
            areaRightMeta.y =       areaMeta.y;
            areaRightMeta.width =   areaMeta.width - this.align * 2 - contentMeta.width;
            areaRightMeta.height =  this.align * 2 + contentMeta.height;

            areaBottomMeta.x =      areaMeta.x;
            areaBottomMeta.y =      areaMeta.y + this.align * 2 + contentMeta.height;
            areaBottomMeta.width =  areaMeta.width;
            areaBottomMeta.height = areaMeta.height - this.align * 2 - contentMeta.height;
        } 
        else {
            throw new Error(`Invalid cut mode ${mode}`);
        }
    }
    /**
     * Создает копию пачки `batch`,
     * добавляет в нее две области с мета-информацией
     * `areaMeta1` и `areaMeta2`.  
     * Затем добавляет копию в стек "toPaste" 
     * @param {cutter.Batch} batch Исходная пачка
     * @param {layout.Meta} areaMeta1 Первая область
     * @param {layout.Meta} areaMeta2 Вторая область
     */
    updateBatches (batch, areaMeta1, areaMeta2) {
        cutter.valid(areaMeta1, 'layout.Meta');
        cutter.valid(areaMeta2, 'layout.Meta');
        
        let areaRight = new layout.Area(areaMeta1);
        let areaBottom = new layout.Area(areaMeta2);
        let newBatch = new this.Batch();
        newBatch.maket = layout.Maket.copy(batch.maket);
        for (let i in batch.areas) {
            newBatch.areas.push(layout.Area.copy(batch.areas[i])); 
            // newBatch.areas.push(batch.areas[i]);
        }
        newBatch.areas.push(areaRight);
        newBatch.areas.push(areaBottom);
        this.toPaste.push(newBatch);
    }
    /**
     * Проверяет, можно ли поместить данный контент 
     * на данную область в данном макете  
     * Использует проверку на размеры и 
     * наличие этого контента на макете
     * @param {layout.Maket} maket Макет
     * @param {layout.Area} area Область
     * @param {content.Content} cont Контент
     */
    relevant (maket, area, cont) {
        cutter.valid(maket, 'layout.Maket');
        cutter.valid(area, 'layout.Area');
        cutter.valid(cont, 'content.Content');

        if (maket.contains(cont)) {
            return false;
        }
        return cutter.Calculator.suit(cont, area, this.align);
    }

    uniqueMakets () {
        let uniqMakets = [];
        for (let i_m in this.makets) {
            let found = false;
            for (let i_u in uniqMakets) {
                if (layout.Maket.equal(this.makets[i_m], uniqMakets[i_u])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqMakets.push(this.makets[i_m]);
            }
        }
        return uniqMakets;
    }
}
module.exports = cutter;