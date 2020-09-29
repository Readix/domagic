const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mustacheExpress = require('mustache-express')

const api = require('./api')
const db = require('./db')
const config = require('./config')

const MiroWidget = require('../stickerman/miroWidget')
const CustomWidget = require('../stickerman/customWidget')
const Stickerman = require('../stickerman/stickerman')

const app = express()

const log = require('./logger')

app.engine('html', mustacheExpress())
app.use(cors())
app.use('/static', express.static('static'))
app.set('view engine', 'html')
app.set('views', __dirname + '/../views')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


// Не нужно для плагина (можно будет лендос сюда закинуть или чтото такое)
app.get('/', (req, res) => {
	const config = require('./config.js')
	let getLinks = []
	config.PLUGINS.map(pluginName => {
		let getLink = db.getPluginProps(pluginName).then(props => {
			let href = 'https://miro.com/oauth/authorize?response_type=code' +
				`&client_id=${props.client_id}&redirect_uri=${config.BASE_URL}/oauth_${pluginName}`
			return `${pluginName}: <a href="${href}">install</a>`
		})
		getLinks.push(getLink)
	})
	Promise.all(getLinks).then(links => {
		res.send(links.join('\n'))
	})
	/*res.render('index', {
		baseUrl: config.BASE_URL,
		oauthUrl: `https://miro.com/oauth/authorize?response_type=code\
			&client_id=${pluginProps.client_id}&redirect_uri=${config.BASE_URL}/oauth` // здесь ...oauth?pay_key=<key>
	})*/
})

app.get('/startSession', async (req, res) => {
	await db.startSession(req.query.user_id, req.query.team_id)
	res.send('Session started successfully')
})

app.get('/endSession', async (req, res) => {
	await db.endSession(req.query.user_id, req.query.team_id)
	res.send('Session ended successfully')
})

// Шаблонизировать, если понадобится
send = async (user, team, response, info, sendData, reqData) => {
	let queryResult= await db.addRequest(user, team, JSON.stringify(reqData), info.code)
		.catch(err =>
			console.log(err.message))
	console.log(queryResult);
	response.send(Object.assign(sendData, info, queryResult))
}

/*
app.use(, async (req, res, next) => {
	try {

	}
	catch(error) {
		log.error(error.stack)
		console.error(error.message)
		send(req.body.user, req.body.team, res, {
			code: 1,
			message: error.stack
		}, {}, req.body)
	}
})
// /\/((?!oauth).)*/
/*
app.use(, async (req, res, next) => {
	db.authorized(req.body.access_token)
		.then(auth => {
			if (auth) {
				next()
			}
			else {
				throw Error('Not authorized query')
			}
		})
})*/

module.exports = { app, send }
