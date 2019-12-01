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
        this.contents = cutter.Calculator.sortContents(contents, 'width');
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
        
        for (area in batch.areas) {
            for (cont in this.contents) {
                if (!this.relevant(batch.maket, area, cont)) {
                    continue;
                }
                let newBatch = new this.Batch();
                newBatch.maket = layout.Maket.copy(batch.maket);
                newBatch.areas = batch.areas;
                let segment = new this.Segment();
                segment.content = cont;
                segment.area = area;
                let pair = new this.Pair();
                pair.batch = newBatch;
                pair.segment = segment;
                this.toSplit.push(pair);
            }
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
        batch.areas = batch.areas.splice(index, 1);

        areaMeta = area.meta;
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

        contentMeta = cont.meta;
        let arearightMeta = new layout.Meta(),
            areaBottomMeta = new layout.Meta();

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
        } else if (mode == 'MODE_H') {
            areaRightMeta.x =       areaMeta.x + this.align * 2 + contentMeta.width;
            areaRightMeta.y =       areaMeta.y;
            areaRightMeta.width =   areaMeta.width - this.align * 2 - contentMeta.width;
            areaRightMeta.height =  this.align * 2 + contentMeta.height;

            areaBottomMeta.x =      areaMeta.x;
            areaBottomMeta.y =      areaMeta.y + this.align * 2 + contentMeta.height;
            areaBottomMeta.width =  areaMeta.width;
            areaBottomMeta.height = areaMeta.height - this.align * 2 - contentMeta.height;
        } else {
            throw new Error(`Invalid cut mode ${mode}`);
        }
    }
    /**
     * Создает копию пачки `batch`,
     * добавляет в нее две области с мета-информацией
     * `areaMeta1` и `areaMeta2`.  
     * Затем добавляет копию в стек "toPaste" 
     * @param {Batch} batch Исходная пачка
     * @param {layout.Meta} areaMeta1 Первая область
     * @param {layout.Meta} areaMeta2 Вторая область
     */
    updateBatches (batch, areaMeta1, areaMeta2) {
        cutter.valid(areaMeta1, 'layout.Meta');
        cutter.valid(areaMeta2, 'layout.Meta');
        
        let areaRight = new layout.Area(areaMeta1);
        let areaBottom = new layout.Area(areaMeta2);
        newBatch = new Batch();
        newBatch.maket = layout.Maket.copy(batch.maket);
        newBatch.areas = batch.areas;
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
}