const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mustacheExpress = require('mustache-express')

const api = require('./api')
const db = require('./db')
const events = require('./events')
const config = require('./config')

const segmentor = require('../segmentor-js/main')
const scoring = require('../scoring')
const layoutObject = require('../layoutObject')
const aligner = require('../aligner/aligner.js')

const app = express()
const port = 3000

const log = require('./logger')
const objectsQuantityLimit = 7

app.engine('html', mustacheExpress())
app.use(cors())
app.use('/static', express.static('static'))
app.set('view engine', 'html')
app.set('views', __dirname + '/../views')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var pluginProps = undefined

function maketToLayout (maket) {
	if (maket.toString() != 'layout.Maket') {
		throw new Error('Invalid maket type');
	}
	let widgets = [];
	for (let i in maket.elements) {
		let element = maket.elements[i];
		let widget = new layoutObject.LayoutWidget(
			element.content.type, element.x, element.y, 
			element.content.meta.width,element.content.meta.height, 
			element.content.id
		);
		widgets.push(widget);
	}
	let scoringLayout = new layoutObject.Layout(widgets, maket.size().width, maket.size().height);
	return scoringLayout;
}

function queryElementToContent (element) {
	try{
		return new segmentor.content.Content(
			segmentor.content.contentTypes[element.type],
			new segmentor.content.Meta(
				parseInt(element.width), 
				parseInt(element.height)
			),
			element.id
		);
	}
	catch(error) {
		throw new Error('Create content from query error\n' + error.stack);
	}
}

function queryElementToLayoutWidget (element) {
	try{
		return new layoutObject.LayoutWidget(
			element.type, element.x, element.y, 
			element.width, element.height, 
			element.id
		);
	}
	catch(error) {
		throw new Error('Create layout widget from query error\n' + error.stack);
	}
}

function getElementsAreaSize (elements) {
	if (elements.length == 0) {
		throw new Error('Empty elements array');
	}
	let left = elements[0].x, 
		top = elements[0].y, 
		right = elements[0].x + elements[0].width, 
		bottom = elements[0].y + + elements[0].height;
	elements.forEach(element => {
		if (element.x < left) left = element.x;
		if (element.y < top) top = element.y;
		if (element.x + element.width > right) right = element.x + element.width;
		if (element.x + element.height > bottom) bottom = element.x + element.height;
	});
	return {
		'width': right - left,
		'height': bottom - top
	};
}

function centeringElements (elements, areaMeta) {
	objectsWidth =
      Math.max(...elements.map(o => o.x + o.content.meta.width)) -
      Math.min(...elements.map(o => o.x));
	objectsHeight = 
      Math.max(...elements.map(o => o.y + o.content.meta.height)) -
      Math.min(...elements.map(o => o.y));
    dx = (areaMeta.width - objectsWidth) / 2;
    dy = (areaMeta.height - objectsHeight) / 2;
    elements.forEach(element => {
		element.x += dx;
		element.y += dy;
    });
}

app.get('/', (req, res) => {
	res.render('index', {
		baseUrl: config.BASE_URL,
		oauthUrl: `https://miro.com/oauth/authorize?response_type=code\
			&client_id=${pluginProps.client_id}&redirect_uri=${config.BASE_URL}/oauth`
	})
})

app.get('/oauth', async (req, res) => {
	console.log('start auth...')
	const response = await api.oauth.getToken(req.query.code, req.query.client_id, pluginProps.client_secret)
	console.log('/oauth/ response = ', response)
	if (response) {
		await db.addAuthorization(response, req.query.client_id)
	}
	res.send('App has been installed, open <br>response: ' + JSON.stringify(response))
})

app.get('/startSession', async (req, res) => {
	await db.startSession(req.query.user_id, req.query.team_id)
	res.send('Session started successfully')
})

app.get('/endSession', async (req, res) => {
	await db.endSession(req.query.user_id, req.query.team_id)
	res.send('Session ended successfully')
})

app.listen(port, () => {
	db.init()
	db.getPluginProps(config.PLUGIN_NAME).then((props) => {
		console.log(props)
		pluginProps = props
		console.log(`App listening on port ${port}`)
	})
})

send = (user, team, response, info, sendData, reqData) => {
	db.addRequest(user, team, JSON.stringify(reqData), info.code)
	response.send(Object.assign(sendData, info))
}

app.get('/generate', async (req, res) => {
	console.log('start generate')
	let status = null
	try{
		info = { 'code': 0, 'message': '' }
		// Empty checking {
		if (req.query.elems == undefined || req.query.elems == []) {
			info.code = 204
			info.message = 'Not found any objects'
			send({}, info, res, req)
			return
		}
		// Types checking {
		suitableQuanity = req.query.elems.reduce((acc, e) =>
			acc + ((e.type in segmentor.content.contentTypes) ? 1: 0), 0)

		if (suitableQuanity != req.query.elems.length) {
			notSuitableType = 'unknown'
			for (let i = 0; i < req.query.elems.length; ++i) {
				if (!(req.query.elems[i].type in segmentor.content.contentTypes)) {
					notSuitableType = req.query.elems[i].type
					break
				}
			}
			info.code = suitableQuanity == 0 ? 202 : 102
			info.message = `Not supported type: ${notSuitableType}`
			if (suitableQuanity == 0) {
				send({}, info, res, req)
				return
			}
		}
		// } types checking
		// Filter
		boardElems = req.query.elems.filter(e => e.type in segmentor.content.contentTypes)
		// Quantity checking {
		if (boardElems.length > objectsQuantityLimit) {
			info.code = 201
			info.message = `Too many objects (must be smaller than ${objectsQuantityLimit + 1})`
			send({}, info, res, req)
			return
		}
		// } quanity checking

		// Stat
		log.trace(`${boardElems.length} objects`)

		// Main algorithm {
		let proc = new scoring.ScoringProccessor();
		
		req.query.board.width = parseFloat(req.query.board.width);
		req.query.board.height = parseFloat(req.query.board.height);
		boardElems = boardElems.map( elem => {
			elem.x = parseFloat(elem.x);
			elem.y = parseFloat(elem.y);
			elem.width = parseFloat(elem.width);
			elem.height = parseFloat(elem.height);
			return elem;
		});

		/* Scoring source maket */
		let areaSize = getElementsAreaSize(boardElems);
		let widgets = []
		boardElems.forEach(element => {
			if (element.type in segmentor.content.contentTypes)
				widgets.push(queryElementToLayoutWidget(element))
		})
		let scoringLayout = new layoutObject.Layout(widgets, req.query.board.width, req.query.board.height);
		let srcScore = proc.getBestLayoutVariant([scoringLayout]);

		source = {
			'width':req.query.board.width,
			'height':req.query.board.height,
			'widgets': widgets
		};

		/* Objects placement */
		let contents = [];
		for (let i = 0; i < boardElems.length; i++) {
			if (boardElems[i].type in segmentor.content.contentTypes) {
				contents.push(queryElementToContent(boardElems[i]));
			}
		}
		
		let ctr = new segmentor.cutter.Cutter(contents);

		ctr.segmente(new segmentor.layout.Area(
			new segmentor.layout.Meta(
					0, 0,
					parseInt(req.query.board.width), 
					parseInt(req.query.board.height)
				)
			), 0
		);

		let makets = ctr.uniqueMakets();

		if (makets.length == 0) {
			info.code = 203
			info.message = 'Objects are too big'
			send({}, info, res, req)
			return
		}
		maketsCount = makets.length;
		if(req.query.isPrevFrame == 'true'){
			makets = [makets[(parseInt(req.query.countCallWithSameFrame) - 1) % makets.length]]
		}
		/* Objects сentering */
		makets.forEach(maket => {
			centeringElements(
				maket.elements, {
					'width': req.query.board.width,
					'height': req.query.board.height
				}
			);
		});
		
		/* Makets scoring */
		let scoringLayouts = [];
		makets.forEach(maket => {
			scoringLayouts.push(maketToLayout(maket));
		});
		let bestlay = proc.getBestLayoutVariant(scoringLayouts);

		send(req.query.user, req.query.team, res, info, {
			'widgets': bestlay.sourseLayout.widgets,
			'score': bestlay.score,
			'sourceScore': srcScore.score,
			'sourseTemplate': srcScore.template,
			'template': bestlay.template,
			'source': source,
			'maketsCount': maketsCount,
			'error': false
		}, req.query)
	} catch (error) {
		log.error(error.stack)
		console.error(error.message)
		info.code = 301
		info.message = 'server error'
		send(req.query.user, req.query.team, res, info, {}, req.query)
	}
})
