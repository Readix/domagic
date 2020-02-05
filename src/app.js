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

app.engine('html', mustacheExpress())
app.use(cors())
app.use('/static', express.static('static'))
app.set('view engine', 'html')
app.set('views', __dirname + '/../views')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

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
		throw new Error('Create content from query error' + error);
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
		throw new Error('Create layout widget from query error: ' + error);
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
		oauthUrl: `https://miro.com/oauth/authorize?response_type=code&client_id=${config.CLIENT_ID}&redirect_uri=${config.BASE_URL}/oauth`
	})
})

app.get('/oauth', async (req, res) => {
	const response = await api.oauth.getToken(req.query.code, req.query.client_id)
	console.log('/oauth/ response = ', response)
	if (response) {
		db.addAuthorization(response)
	}
	res.send('App has been installed, open <br>response: ' + JSON.stringify(response))
})

app.get('/boards-list/', async (req, res) => {
	const auth = db.getAuthorizations()[0]
	if (auth) {
		api.boards.getAll(auth)
			.then(data => {
				res.send(JSON.stringify(data))
			})
			.catch(error => {
				res.send(error)
			})
	} else {
		res.send('You are not authorized yet')
	}
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
	db.init()
})

// Webhooks are coming soon
app.post('/events', (req, res) => {
	const verificationToken = req.get('X-RTB-Verification-Token')
	if (verificationToken === config.WEBHOOKS_VERIFICATION_TOKEN) {
		events.processEvent(req.body, res)
	} else {
		res.status(400).send('Incorrect verification token')
	}
})

app.get('/test1', async (req, res) => {
	try{
		let proc = new scoring.ScoringProccessor();
		
		req.query.board.width = parseFloat(req.query.board.width);
		req.query.board.height = parseFloat(req.query.board.height);
		req.query.elems = req.query.elems.map( elem => {
			elem.x = parseFloat(elem.x);
			elem.y = parseFloat(elem.y);
			elem.width = parseFloat(elem.width);
			elem.height = parseFloat(elem.height);
			return elem;
		});
		console.log(req.query);
		/* Скоринг исходного макета */
		let areaSize = getElementsAreaSize(req.query.elems);
		let widgets = []
		req.query.elems.forEach(element => {
			widgets.push(queryElementToLayoutWidget(element));
		})
		let scoringLayout = new layoutObject.Layout(widgets, req.query.board.width, req.query.board.height);
		let srcScore = proc.getBestLayoutVariant([scoringLayout]);

		source = {
			'width':req.query.board.width,
			'height':req.query.board.height,
			'widgets': widgets
		};

		/* Расстановка объектов */
		let contents = [];
		for (let i = 0; i < req.query.elems.length; i++) {
			if (req.query.elems[i].type in segmentor.content.contentTypes) {
				contents.push(queryElementToContent(req.query.elems[i]));
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
		console.log('makets count:', makets.length);
		if (makets.length == 0) {
			res.send({
				'error': true,
				'message': '0 makets'
			});
			return;
		}
		maketsCount = makets.length;
		if(req.query.isPrevFrame == 'true'){
			makets = [makets[(parseInt(req.query.countCallWithSameFrame) - 1) % makets.length]]
		}
		// makets = [makets[8]];
		/* Центрирование объектов по середине */
		makets.forEach(maket => {
			centeringElements(
				maket.elements, {
					'width': req.query.board.width,
					'height': req.query.board.height
				}
			);
		});
		
		/* Скоринг макетов */
		let scoringLayouts = [];
		makets.forEach(maket => {
			scoringLayouts.push(maketToLayout(maket));
		});
		let bestlay = proc.getBestLayoutVariant(scoringLayouts);
		// let bestlay = proc.getAllScoresOfTemplatesForLayout(scoringLayouts);
		
		res.send({
			'widgets': bestlay.sourseLayout.widgets,
			'score': bestlay.score,
			'sourceScore': srcScore.score,
			'sourseTemplate': srcScore.template,
			'template': bestlay.template,
			'source': source,
			'maketsCount': maketsCount,
			'error': false
		});
		// aligner.init(req.query.elems, 50);
		// aligner.transform();
		// res.send(aligner.elements);
	} catch (error) {
		res.send('server error: ' + error, ', line: ' + error.lineNumber);
		return;
	}
})
