const { app, send } = require('../app-base')
const log = require('../logger')
const db = require('../db')
const api = require('../api')

const MiroWidget = require('../../stickerman/miroWidget')
const CustomWidget = require('../../stickerman/customWidget')
const Stickerman = require('../../stickerman/stickerman')

// Переделать логику потом, oauth на каждый плагин
app.get('/oauth_stickerman', async (req, res) => {
	console.log('start auth...')
	let secret = await db.getSecret('stickerman')
	if (!secret) {
		let msg = 'Not found client secret in database for stickerman'
		log.error(msg)
		console.error(msg)
	}
	const response = await api.oauth.getToken('stickerman', req.query.code, req.query.client_id, secret.client_secret)
	console.log('/oauth/ response = ', response)
	if (response) {
		await db.addAuthorization(response, req.query.client_id)
	}
	res.send('App has been installed, open <br>response: ' + JSON.stringify(response))
})

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
		compose: ['blocky', 'blocky']
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


app.post('/rate', async (req, res) => {
	try{
		if (typeof  req.body.comment === 'undefined') {
			req.body.comment="undefined";
		}
			await db.addFeedback(req.body.user_id,req.body.team_id,req.body.request_id, req.body.grade, req.body.comment);
			await db.feedbackToRequest(req.body.user_id,req.body.team_id,req.body.request_id);
		res.sendStatus(200);
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
