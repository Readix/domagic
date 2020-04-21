var fs = require('fs');
var layoutObject = require('./layoutObject');

var pathToTemplates = "templates-json";

class ScoringProccessor{
	constructor(){
		this.templates = [];
		let files = fs.readdirSync(pathToTemplates);

		for (let i=0; i < files.length; i++) {
	    	let data = fs.readFileSync(pathToTemplates + "/" + files[i]);
	    	let layout = JSON.parse(data);
		    this.templates.push( new layoutObject.Layout( layout.objects.map((item) => {
		    	return new layoutObject.LayoutWidget(item.type, item.leftTop.x, item.leftTop.y, 
		    		item.shape.width, item.shape.height);
		    }), layout.width, layout.height, files[i]));
		}
	}
	_resize(sourseLayout, requireWidth, requireHeight) {
		if(!sourseLayout.width === requireWidth || !sourseLayout.height === requireHeight){
			let shrinkWidth = requireWidth/sourseLayout.width;
			let shrinkHeight = requireHeight/sourseLayout.height;
			sourseLayout.widgets.forEach((item) => {
				item.width *= shrinkWidth;
				item.height *= shrinkHeight;
				item.area.leftTop.x *= shrinkWidth;
				item.area.leftTop.y *= shrinkHeight;
				item.area.rightBottom.x *= shrinkWidth;
				item.area.rightBottom.y *= shrinkHeight;
			});
			sourseLayout.width = requireWidth;
			sourseLayout.height = requireHeight;
		}
		return sourseLayout;
	}
	//интегральный скоринг без учета кейса когда объект сгенеррованного слайда больше и польностью перекрывает объект шаблона
	// _scoreLayoutByTemplate(sourseLayout, templateLayout) {
	// 	let totalEqualPixels = 0;
	// 	let totalTemplateWidgetPixels = 0;
	// 	templateLayout.widgets.forEach((templateWidget) => {
	// 		let lengthToCenter = Math.max(templateWidget.width, templateWidget.height);
	// 		let widgetBorders = templateWidget.area.leftTop.copy().subtract(templateWidget.area.rightBottom).devide(2)
	// 		totalTemplateWidgetPixels += Math.integral(lengthToCenter, -widgetBorders.x, widgetBorders.x, -widgetBorders.y, widgetBorders.y);
	// 		sourseLayout.widgets.forEach((sourseWidget) => {
	// 			let area = templateWidget.crossingAreaWith(sourseWidget);
	// 			let widgetCenter = templateWidget.area.getCenter();
	// 			let leftAreaBorder = area.leftTop.copy().subtract(widgetCenter);
	// 			let rightAreaBorder = area.rightBottom.copy().subtract(widgetCenter);
	// 			totalEqualPixels += Math.integral(lengthToCenter, leftAreaBorder.x, rightAreaBorder.x, leftAreaBorder.y, rightAreaBorder.y);
	// 		});
	// 	});
	// 	return totalEqualPixels * 100/totalTemplateWidgetPixels;
	// }
	_scoreLayoutByTemplate(sourseLayout, templateLayout) {
		let score = 0;
		let totalSquare = 0;
		// console.log(templateLayout.name);
		sourseLayout.widgets.forEach((sourseWidget) => {
			let subScores = [];
			let badCrossCount = 1;
			// console.log('widgetId: ' + sourseWidget.id);
			let per = 0;
			templateLayout.widgets.forEach((templateWidget) => {
				let templateCenter = templateWidget.area.rightBottom.copy().sum(templateWidget.area.leftTop).devide(2);
				let sourseCenter = sourseWidget.area.rightBottom.copy().sum(sourseWidget.area.leftTop).devide(2);
				let templateSquare = templateWidget.area.square();
				let areaSquare = templateWidget.crossingAreaWith(sourseWidget).square();
				let sourseSquare = sourseWidget.area.square();
				let multiplier;
				if(templateWidget.type != sourseWidget.type){
					multiplier = 0.05;
					badCrossCount++;
				}else
					multiplier = 1;
				subScores.push(multiplier * areaSquare / sourseSquare);
				if (areaSquare == 0) return;
				per++;
				// score += (multiplier * ((templateSquare - areaSquare) + (sourseSquare - areaSquare))/(templateSquare + sourseSquare) /*+ templateCenter.subtract(sourseCenter).length()/Math.sqrt(Math.pow(templateLayout.height, 2) + Math.pow(templateLayout.width, 2))*/);
			});
			let sum = 0;
			subScores.forEach(e => sum +=e);
			if (per == 0) return;
			score += sum * Math.pow(0.7, per - 1) / per;
			// console.log('score: ' + (sum * Math.pow(0.7, per - 1) / per));
			// score += Math.max(...subScores) / badCrossCount;
		});
		return score/sourseLayout.widgets.length;
		//return score * Math.pow(0.9, sourseLayout.widgets.length - 1);
		// return score/(templateLayout.widgets.length*sourseLayout.widgets.length*2);
	}
	getBestLayoutVariant(arrayLayouts){
		let arrResults = [];
		for(let i=0; i<arrayLayouts.length; i++){
			let result = this.getMostEqualTemplateAndScore(arrayLayouts[i]);
			result["sourseLayout"] = arrayLayouts[i];
			arrResults.push(result);
		}
		arrResults = arrResults.sort((x, y) => {
			if(x.score > y.score)
				return -1;
			if(x.score < y.score)
				return 1;
			return 0;
		});
		// console.log(arrResults);
		return arrResults[0];
	}
	getMostEqualTemplateAndScore(sourseLayout){
		let maxScore = 0;
		let maxScoreNum;
		for (let i = 0; i < this.templates.length; i++) {
			// let resizedSourseLayout = this._resize(sourseLayout.copy(), this.templates[i].width, this.templates[i].height);
			// console.log('template name: ' + this.templates[i].name);
			// console.log(resizedSourseLayout);
			let currentScore = this._scoreLayoutByTemplate(sourseLayout.copy(), this.templates[i]);
			// let currentScore = this._scoreLayoutByTemplate(resizedSourseLayout, this.templates[i]);
			if(currentScore > maxScore){
				maxScore = currentScore;
				maxScoreNum = i;
			}
		}
		return {"template": this.templates[maxScoreNum], "score": maxScore};
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

Math.integral = function(c, x1, x2, y1, y2) {
	return c*(x2-x1)*(y2-y1)-(y2-y1)*(x2*x2*Math.sign(x2)/2-x1*x1*Math.sign(x1)/2)-(x2-x1)*(y2*y2*Math.sign(y2)/2-y1*y1*Math.sign(y1)/2)
}

module.exports.ScoringProccessor = ScoringProccessor;