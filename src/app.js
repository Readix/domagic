const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mustacheExpress = require('mustache-express')
const { RequestError } = require('request-promise/errors')

const api = require('./api')
const db = require('./db')
const config = require('./config')

const MiroWidget = require('../stickerman/miroWidget')
const CustomWidget = require('../stickerman/customWidget')
const Stickerman = require('../stickerman/stickerman')

const app = express()
const port = 3000

const log = require('./logger')

app.engine('html', mustacheExpress())
app.use(cors())
app.use('/static', express.static('static'))
app.set('view engine', 'html')
app.set('views', __dirname + '/../views')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var pluginProps = undefined

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
		let result = await db.getInstallation(response.user_id, response.team_id, req.query.client_id)
		if (!result)
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

let settings = {
	horizontal: {
		order: { values: ['height', 'width'], desc: true },
		compose: ['horizontal', 'vertical']
	},
	vertical: {
		order: { values: ['width', 'height'], desc: true },
		compose: ['vertical', 'horizontal']
	},
	blocky: {
		order: { values: ['width', 'width'], desc: true},
		compose: ['blocky', 'horizontal']
	}
}

let terms = [
	{// criteria
		c: 'color',
		s: 'size',
		t: 'text',
		w: 'width',
		w: 'height',
	},
	{// order
		w: 'width',
		h: 'height',
	},
	{// compose
		h: 'horizontal',
		v: 'vertical',
		b: 'blocky',
	}
]

let parseParams = paramsString => {
	let desc = false
	let params = paramsString
		.split(';')
		.map((sector, i) =>
			Array.from(sector)
			.map(letter => {
				if (letter == '-') desc = true
				if (!(letter in terms[i])) 
					throw TypeError('Unknown letter "' + letter + '"')
				return terms[i][letter]
			})
		)
	return {
		clustering: params[0],
		order: { values: params[1], desc: desc},
		compose: params[2]
	}
}

let validOverparams = paramsString => {
	if(typeof paramsString == 'undefined') return false
	paramsString = paramsString.replace(' ', '')
	let sectors = paramsString.split(';')
		.map(sector => sector.replace('-', ''))
	return sectors.length == 3 &&
	sectors[1].length == sectors[0].length + 1 && 
	sectors[1].length == sectors[2].length
}

app.post('/widgetComposer', async (req, res) => {
	try {
		console.log('compose')
		console.log('overparams: ', req.body.overparams)
		req.body.widgets = Object.values(req.body.widgets)
		let skins = req.body.widgets.map(widget => new CustomWidget(widget))
		let sm = new Stickerman()
		
		let isValid = validOverparams(req.body.overparams)
		console.log(isValid)
		let setts = isValid ?
			parseParams(req.body.overparams) :
			Object.assign(
				{ clustering: [req.body.criterion.toLowerCase()] },
				settings[req.body.composition.toLocaleLowerCase()]
			)
		console.log(setts);
		await sm.run(skins, setts)
		send(req.body.user, req.body.team, res, {
			code: 0,
			message: 'success',
		},{
			widgets: req.body.widgets,
		}, req.body)
	}
	catch (error) {
		log.error(error.stack)
		console.error(error.message)
		send(req.body.user, req.body.team, res, {
			code: 1,
			message: error.stack
		}, {}, req.body)
	}
})
