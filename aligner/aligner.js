var aligner = class {
    init (elements, align = 50) {
        this.maxDistance = align;
        this.elements = elements;
        this.alignTypes = [
            'left', 'right', 'top', 'bottom', 'x-center', 'y-center'
        ];
        this.A = {};
        this.B = {};
        this.I = {};
        for (let i in this.elements) {
            i = parseInt(i);
            for (let j = parseInt(i) + 1; j < this.elements.length; ++j) {
                this.A[this.key(i, j)] = {}
                this.alignTypes.forEach(type => {
                    this.A[this.key(i, j)][type] = false;
                })
            }
        }
    }
    key (i, j) {
        let min = Math.min(i, j);
        let max = Math.max(i, j);
        return min + '_' + max;
    }
    parseKey (key) {
        return key.split('_').map(i => parseInt(i));
    }
    distance (i, j, type) {
        switch (type) {
            case 'left':
                return this.elements[i].x - this.elements[j].x;
            case 'right':
                return  this.elements[i].x + this.elements[i].width - 
                        (this.elements[j].x + this.elements[j].width);
            case 'bottom':
                return  this.elements[i].y + this.elements[i].height - 
                        (this.elements[j].y + this.elements[j].height);
            case 'top':
                return this.elements[i].y - this.elements[j].y;
            case 'x-center':
                return  this.elements[i].x + this.elements[i].width / 2 -
                        (this.elements[j].x + this.elements[j].width / 2)
            case 'y-center':
                return  this.elements[i].y + this.elements[i].height / 2 -
                        (this.elements[j].y + this.elements[j].height / 2)
            default:
                throw new Error('Not found type ' + type + ' in aligner');
        }
    }
    betweenHorizontalIsFree (i, j) {
        let maxX = Math.max(this.elements[i].x, this.elements[j].x);
        let minX = Math.min(this.elements[i].x, this.elements[j].x);
        let maxY = Math.max(this.elements[i].y, this.elements[j].y);
        let minY = Math.min(
            this.elements[i].y + this.elements[i].height, 
            this.elements[j].y + this.elements[j].height
        );
        for (k in this.elements) {
            k = parseInt(k);
            if (k == i || k == j) continue;
            if (this.elements[k].x > minX && this.elements[k].x < maxX &&
                (this.elements[k].y > minY && this.elements[k].y < maxY ||
                this.elements[k].y + this.elements[k].height > minY && 
                this.elements[k].y + this.elements[k].height < maxY)) {
                    return false;
                }
        }
        return true;
    }
    betweenVerticalIsFree (i, j) {
        let maxY = Math.max(this.elements[i].y, this.elements[j].y);
        let minY = Math.min(this.elements[i].y, this.elements[j].y);
        let maxX = Math.max(this.elements[i].x, this.elements[j].x);
        let minX = Math.min(
            this.elements[i].x + this.elements[i].width, 
            this.elements[j].x + this.elements[j].width
        );
        for (let k in this.elements) {
            k = parseInt(k);
            if (k == i || k == j) continue;
            if (this.elements[k].y > minY && this.elements[k].y < maxY &&
                (this.elements[k].x > minX && this.elements[k].x < maxX ||
                this.elements[k].x + this.elements[k].width > minX && 
                this.elements[k].x + this.elements[k].width < maxX)) {
                    return false;
                }
        }
        return true;
    }
    betweenIsFree (key) {
        let horizontal = [ 'left', 'right', 'x-center' ];
        /* let vertical = [ 'top', 'bottom', 'y-center' ]; */
        let indexes = this.parseKey(key);
        for (let _type in this.A[key]) {
            if (this.A[key][_type]) {
                return _type in horizontal ? 
                    this.betweenHorizontalIsFree(indexes[0], indexes[1]) :
                    this.betweenVerticalIsFree(indexes[0], indexes[1]);
            }
        }
        return true;
    }
    enumerateA () {
        for (let i in this.elements) {
            i = parseInt(i);
            for (let j = parseInt(i) + 1; j < this.elements.length; ++j) {
                this.alignTypes.forEach(type => {
                    this.A[this.key(i, j)][type] =
                        this.distance(i, j, type) < this.maxDistance;
                })
            }
        }
    }
    enumerateB () {
        for (let key in this.A) {
            try{
            this.B[key] = this.betweenIsFree(key);
            }
            catch(error) {
                let indexes = this.parseKey(key);
                throw new Error(error + 'error! : key: ' + indexes);
            }
        }
    }
    enumerateI () {
        for (let i in this.elements) {
            i = parseInt(i);
            for (let j = parseInt(i) + 1; j < this.elements.length; ++j) {
                let key = this.key(i, j);
                this.I[key] = {};
                this.alignTypes.forEach(type => {
                    this.I[key][type] = this.A[key][type] && this.B[key];
                });
            }
        }
    }
    alignLeft (i, j) {
        // в сторону самого левого элемента
        let minX = Math.min(this.elements[i].x, this.elements[j].x);
        let maxX = Math.max(this.elements[i].x, this.elements[j].x);
        this.elements[i].x = minX;
        this.elements[j].x = minX;
    }
    alignRight (i, j) {
        // в сторону самого правого элемента
        let minX = Math.min(
            this.elements[i].x + this.elements[i].width, 
            this.elements[j].x + this.elements[j].width
        );
        let maxX = Math.max(
            this.elements[i].x + this.elements[i].width, 
            this.elements[j].x + this.elements[j].width
        );
        this.elements[i].x = maxX;
        this.elements[j].x = maxX;
    }
    alignTop (i, j) {
        // в сторону самого верхнего элемента
        let minY = Math.min(
            this.elements[i].y,
            this.elements[j].y
        );
        let maxY = Math.max(
            this.elements[i].y,
            this.elements[j].y
        );
        this.elements[i].y = minY;
        this.elements[j].y = minY;
    }
    alignBottom (i, j) {
        // в сторону самого нижнего элемента
        let minY = Math.min(
            this.elements[i].y + this.elements[i].height,
            this.elements[j].y + this.elements[j].height
        );
        let maxY = Math.max(
            this.elements[i].y + this.elements[i].height,
            this.elements[j].y + this.elements[j].height
        );
        this.elements[i].y = maxY;
        this.elements[j].y = maxY;
    }
    alignXCenter (i, j) {
        // в сторону самого левого элемента
        let minX = Math.min(
            this.elements[i].x + this.elements[i].width / 2,
            this.elements[j].x + this.elements[j].width / 2
        );
        let maxX = Math.max(
            this.elements[i].x + this.elements[i].width / 2,
            this.elements[j].x + this.elements[j].width / 2
        );
        this.elements[i].x = minX;
        this.elements[j].x = minX;
    }
    alignYCenter (i, j) {
        // в сторону самого верхнего элемента
        let minY = Math.min(
            this.elements[i].y + this.elements[i].height / 2,
            this.elements[j].y + this.elements[j].height / 2
        );
        let maxY = Math.max(
            this.elements[i].y + this.elements[i].height / 2,
            this.elements[j].y + this.elements[j].height / 2
        );
        this.elements[i].y = minY;
        this.elements[j].y = minY;
    }
    // enumerateN () {}
    alignTypeToRunner (i, j, alignType) {
        switch (alignType) {
            case 'left': this.alignLeft(i, j); return;
            case 'right': this.alignRight(i, j); return;
            case 'top': this.alignTop(i, j); return;
            case 'bottom': this.alignBottom(i, j); return;
            case 'x-center': this.alignXCenter(i, j); return;
            case 'y-center': this.alignYCenter(i, j); return;
            default: throw new Error('Not found align type:' + alignType);
        }
    }
    runAlign () {
        for(let i in this.elements) {
            i = parseInt(i);
            for (let j = parseInt(i) + 1; j < this.elements.length; ++j) {
                let key = this.key(i, j);
                for(let alignType in this.I[key]) {
                    if (this.I[key][alignType]) {
                        this.alignTypeToRunner(i, j, alignType);
                        // обнулять остальные выравнивания для каждого ключа после выполнения как минимум одного 
                        break;
                    }
                }
            }
        }
    }
    transform () {
        this.enumerateA();
        this.enumerateB();
        this.enumerateI();
        this.runAlign();
    }
}

module.exports = new aligner();