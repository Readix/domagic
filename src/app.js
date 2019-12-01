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

const app = express()
const port = 3000

app.engine('html', mustacheExpress())
app.use(cors())
app.use('/static', express.static('static'))
app.set('view engine', 'html')
app.set('views', __dirname + '/../views')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

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
		let contents = [];
		for (let i = 0; i < req.query.elems.length; i++) {
			contents.push(new segmentor.content.Content(
				segmentor.content.contentTypes.IMAGE,
				new segmentor.content.Meta(
					parseInt(req.query.elems[i].width), 
					parseInt(req.query.elems[i].height)
				),
				req.query.elems[i].id
			));
		}
		
		let ctr = new segmentor.cutter.Cutter(
			contents
		);

		ctr.segmente(new segmentor.layout.Area(
				new segmentor.layout.Meta(
					0, 0,
					parseInt(req.query.board.width), 
					parseInt(req.query.board.height)
				)
			), 
			10
		);
		
		let makets = ctr.uniqueMakets();
		console.log('makets count:', makets.length);
		
		let lays = [];
		for (i in makets) {
			let widgets = [];
			for (j in makets[i].elements){
				let element = makets[i].elements[j];
				let widget = new scoring.LayoutWidget(
					2, element.x, element.y, 
					element.content.meta.width,element.content.meta.height, 
					element.content.id
				);
				widgets.push(widget);
			}
			let lay = new scoring.Layout(widgets, makets[i].size().width, makets[i].size().height);
			lays.push(lay);
		}

		let proc = new scoring.ScoringProccessor();
		let bestlay = proc.getBestLayoutVariant(lays);
		let f = bestlay.sourseLayout.fitTo(bestlay.template);
		res.send(bestlay.sourseLayout.widgets);
	} catch (error) {
		res.send(error);
		return;
	}
})