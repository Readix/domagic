class Layout{
	constructor(widgets, width, height, name = "None"){
		this.widgets = widgets;
		this.width = width;
		this.height = height;
		this.name = name;
	}
	//must have same count widgets
	fitTo(layout){
		if(this.widgets.length != layout.widgets.length)
			return false;

		let arrayOfCrosses = new Array(this.widgets.length);
		for(let i=0; i<arrayOfCrosses.length; i++)
			arrayOfCrosses[i] = new Array(layout.widgets.length);
		for(let i=0; i<this.widgets.length; i++)
			for(let j=0; j<layout.widgets.length; j++){
				let area = layout.widgets[j].crossingAreaWith(this.widgets[i], true);
				let scoring = this.widgets[i].type == layout.widgets[j].type ? 1 : 0.5;
				arrayOfCrosses[i][j] = area.square() * scoring;
			}
		let getMax = (array) =>{
			let ii = 0, jj = 0;
			for(let i=0; i<array.length; i++){
				for(let j=0; j<array[i].length; j++){
					if(array[i][j] > array[ii][jj]){
						ii = i;
						jj = j;
					}
				}
			}
			return {"i": ii, "j": jj};
		}
		for(let i=0; i<arrayOfCrosses.length; i++){
			let max = getMax(arrayOfCrosses);
			this.widgets[max.i].fitTo(layout.widgets[max.j]);
		}
		return true;
    }
    equal(layout){
        if(layout.width != this.width || layout.height != this.height || layout.widgets.length != this.widgets.length)
            return false;
        for(let i=0; i<this.widgets.length; i++)
            if(layout.widgets.find((widget) => {
                return widget.equal(this.widgets[i]);
            }) == undefined)
             return false;
        return true;
	}
	copy(){
		return new Layout(this.widgets.map(widget => { return widget.copy(); }), this.width, this.height, this.name);
	}
}
//Widget on layout
class LayoutWidget{
	constructor(type, x_left, y_top, width, height, id = -1){
		this.type = type
		/*if(typeof(type) == 'number')
			this.type = type;
		else
			switch(type){
				case "TEXT"   :
				case "STICKER": this.type = 1; break;
				case "SHAPE"  :
				case "MOCKUP"  :
				case "LINE"  :
				case "IMAGE"  : this.type = 2; break;
				default: throw Error("LayoutWidget dont understant type: " + type);
			}*/
		this.area = new Area(new Point(x_left, y_top), new Point(x_left + width, y_top + height))
		this.width = width;
		this.height = height;
		this.id = id;
	}
	crossingAreaWith(widget, enableCrossingOfDifferentWidgetsType = false){
		if( ( enableCrossingOfDifferentWidgetsType || this.type == widget.type )
			&& !(this.area.leftTop.x > widget.area.rightBottom.x 
				|| this.area.rightBottom.x < widget.area.leftTop.x 
				|| this.area.rightBottom.y < widget.area.leftTop.y 
				|| this.area.leftTop.y > widget.area.rightBottom.y)){
			let areaLeftTop = new Point(this.area.leftTop.x > widget.area.leftTop.x ? this.area.leftTop.x : widget.area.leftTop.x,
      		this.area.leftTop.y > widget.area.leftTop.y ? this.area.leftTop.y : widget.area.leftTop.y);
      		let areaRightBottom = new Point(this.area.rightBottom.x < widget.area.rightBottom.x ? this.area.rightBottom.x : widget.area.rightBottom.x,
      		this.area.rightBottom.y < widget.area.rightBottom.y ? this.area.rightBottom.y : widget.area.rightBottom.y);
      		return new Area(areaLeftTop, areaRightBottom);
      	}else{
      		return new Area(new Point(0,0), new Point(0,0));
      	}
	}
	fitTo(widget){
		this.area = widget.area.copy()
		this.width = widget.width;
		this.height = widget.height;
    }
    equal(widget){
        if(widget.width != this.width || widget.height != this.height || widget.area.equal(this.area))
            return false;
        return true;
	}
	copy(){
		return new LayoutWidget(this.type, this.area.leftTop.x, this.area.leftTop.y, this.width, this.height);
	}
}

class Area{
	constructor(leftTop, rightBottom){
		this.leftTop = leftTop;
		this.rightBottom = rightBottom;
	}
	copy(){
		return new Area(this.leftTop, this.rightBottom);
	}
	square(){
		return (this.rightBottom.x - this.leftTop.x) * (this.rightBottom.y - this.leftTop.y);
	}
	getCenter(){
		return new Point((this.rightBottom.x + this.leftTop.x)/2, (this.rightBottom.y + this.leftTop.y)/2)
    }
    equal(area){
        if(this.leftTop.equal(area.leftTop) == false || this.rightBottom.equal(area.rightBottom) == false)
            return false;
        return true;
    }
}

class Point{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
	between(f, s){
		if(this.x.between(f.x, s.x, true) || this.y.between(f.y, s.y, true))
			return true;
		else
			return false;
	}
	copy(){
		return new Point(this.x, this.y);
	}
	subtract(p){
		this.x -= p.x;
		this.y -= p.y;
		return this;
	}
	sum(p){
		this.x += p.x;
		this.y += p.y;
		return this;
	}
	devide(d){
		this.x /= d;
		this.y /= d;
		return this;
	}
	length(){
		return Math.abs(this.x) + Math.abs(this.y);
    }
    equal(point){
        if(point.x != this.x || point.y != this.y)
            return false;
        return true;
    }
}

module.exports.Point = Point;
module.exports.Layout = Layout;
module.exports.LayoutWidget = LayoutWidget;
module.exports.Area = Area;