var fs = require('fs');

var pathToTemplates = "templates-json";

class ScoringProccessor{
	constructor(){
		this.templates = [];
		let files = fs.readdirSync(pathToTemplates);

		for (let i=0; i < files.length; i++) {
	    	let data = fs.readFileSync(pathToTemplates + "/" + files[i]);
	    	let layout = JSON.parse(data);
		    this.templates.push( new Layout( layout.objects.map((item) => {
		    	return new LayoutWidget(item.type, item.leftTop.x - item.shape.width/2, item.leftTop.y - item.shape.height/2, 
		    		item.shape.width, item.shape.height);
		    }), layout.width, layout.height));
		}
	}
	_resize(sourseLayout, requireWidth, requireHeight) {
		if(!sourseLayout.width === requireWidth || !sourseLayout.height === requireHeight){
			let shrinkWidth = requireWidth/sourseLayout.width;
			let shrinkHeight = requireHeight/sourseLayout.height;
			sourseLayout.widgets.forEach((item) => {
				item.width *= shrinkWidth;
				item.height *= shrinkHeight;
				item.leftTop.x *= shrinkWidth;
				item.leftTop.y *= shrinkHeight;
				item.rightBottom.x *= shrinkWidth;
				item.rightBottom.y *= shrinkHeight;
			});
			sourseLayout.width = requireWidth;
			sourseLayout.height = requireHeight;
		}
		return sourseLayout;
	}
	_scoreLayoutByTemplate(sourseLayout, templateLayout) {
		let totalEqualPixels = 0;
		let totalTemplateWidgetPixels = 0;
		templateLayout.widgets.forEach((templateWidget) => {
			totalTemplateWidgetPixels += templateWidget.width * templateWidget.height;
			sourseLayout.widgets.forEach((sourseWidget) => {
				let area = templateWidget.crossingAreaWith(sourseWidget);
				totalEqualPixels += area.square();
			});
		});
		return totalEqualPixels * 100/totalTemplateWidgetPixels;
	}
	getBestLayoutVariant(arrayLayouts){
		let arrResults = [];
		for(let i=0; i<arrayLayouts.length; i++){
			arrResults = arrResults.concat(this.getAllScoresOfTemplatesForLayout(arrayLayouts[i]));
		}
		arrResults = arrResults.filter((item) => {
			if(item.sourseLayout.widgets.length != item.template.widgets.length)
				return false;
			return true;
		})
		arrResults = arrResults.sort((x, y) => {
			if(x.score > y.score)
				return -1;
			if(x.score < y.score)
				return 1;
			return 0;
		});
		return arrResults[0];
	}
	getMostEqualTemplateAndScore(sourseLayout){
		let maxScore = -1;
		let maxScoreNum;
		for (let i = 0; i < this.templates.length; i++) {
			let resizedSourseLayout = this._resize(sourseLayout, this.templates[i].width, this.templates[i].height);
			let currentScore = this._scoreLayoutByTemplate(resizedSourseLayout, this.templates[i]);
			if(currentScore > maxScore){
				maxScore = currentScore;
				maxScoreNum = i;
			}
		}
		return {"template": this.templates[maxScoreNum], "score": maxScore, "sourseLayout" : sourseLayout};
	}
	getAllScoresOfTemplatesForLayout(sourseLayout){
		let arr = [];
		for (let i = 0; i < this.templates.length; i++) {
			let resizedSourseLayout = this._resize(sourseLayout, this.templates[i].width, this.templates[i].height);
			let currentScore = this._scoreLayoutByTemplate(resizedSourseLayout, this.templates[i]);
			arr.push({"template": this.templates[i], "score": currentScore, "sourseLayout" : sourseLayout});
		}
		return arr;
	}
}

class Layout{
	constructor(widgets, width, height){
		this.widgets = widgets;
		this.width = width;
		this.height = height;
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
}
//Widget on layout
class LayoutWidget{
	constructor(type, x_left, y_top, width, height, id = -1){
		this.type = type;
		this.leftTop = new Point(x_left, y_top);
		this.width = width;
		this.height = height;
		this.rightBottom = new Point(x_left + width, y_top + height);
		this.id = id;
	}
	crossingAreaWith(widget, enableCrossingOfDifferentWidgetsType = false){
		if( ( enableCrossingOfDifferentWidgetsType || this.type == widget.type )
			&& !(this.leftTop.x > widget.rightBottom.x 
				|| this.rightBottom.x < widget.leftTop.x 
				|| this.rightBottom.y < widget.leftTop.y 
				|| this.leftTop.y > widget.rightBottom.y)){
			let areaLeftTop = new Point(this.leftTop.x > widget.leftTop.x ? this.leftTop.x : widget.leftTop.x,
      		this.leftTop.y > widget.leftTop.y ? this.leftTop.y : widget.leftTop.y);
      		let areaRightBottom = new Point(this.rightBottom.x < widget.rightBottom.x ? this.rightBottom.x : widget.rightBottom.x,
      		this.rightBottom.y < widget.rightBottom.y ? this.rightBottom.y : widget.rightBottom.y);
      		return new Area(areaLeftTop, areaRightBottom);
      	}else{
      		return new Area(new Point(0,0), new Point(0,0));
      	}
	}
	fitTo(widget){
		this.leftTop.x = widget.leftTop.x;
		this.leftTop.y = widget.leftTop.y;
		this.rightBottom.x = widget.rightBottom.x;
		this.rightBottom.y = widget.rightBottom.y
		this.width = widget.width;
		this.height = widget.height;
	}
}

class Area{
	constructor(leftTop, rightBottom){
		this.leftTop = leftTop;
		this.rightBottom = rightBottom;
	}
	square(){
		return (this.rightBottom.x - this.leftTop.x) * (this.rightBottom.y - this.leftTop.y);
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
}

module.exports.Point = Point;
module.exports.Layout = Layout;
module.exports.LayoutWidget = LayoutWidget;
module.exports.Area = Area;
module.exports.ScoringProccessor = ScoringProccessor;

// let sourseLayout = JSON.parse('{"objects":[{"type":1,"leftTop":{"x":17,"y":29},"shape":{"height":31,"width":158}},{"type":1,"leftTop":{"x":146,"y":76},"shape":{"height":27,"width":231}},{"type":2,"leftTop":{"x":22,"y":141},"shape":{"height":309,"width":354}},{"type":1,"leftTop":{"x":16,"y":489},"shape":{"height":16,"width":223}},{"type":1,"leftTop":{"x":166,"y":537},"shape":{"height":33,"width":213}}],"width":400,"height":600}');
// let proccessor = new ScoringProccessor();
// let result = proccessor.getMostEqualTemplateAndScore(new Layout(sourseLayout.objects.map((item)=>{
// 	return new LayoutWidget(item.type, item.leftTop.x - item.shape.width/2, item.leftTop.y - item.shape.height/2, item.shape.width, item.shape.height);
// }), sourseLayout.width, sourseLayout.height));
// console.log(result);