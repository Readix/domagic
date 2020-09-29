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
	await db.startSession(req.query.access_token)
	res.send('Session started successfully')
})

app.get('/endSession', async (req, res) => {
	await db.endSession(req.query.access_token)
	res.send('Session ended successfully')
})

send = async (access_token, response, info, sendData, reqData) => {
	let queryResult= await db.addRequest(access_token, JSON.stringify(reqData), info.code)
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

saveRequest = async (access_token, res, err, data, saveData) => {
	db.addRequest(access_token, JSON.stringify(reqData), err.code)
		.then(res => console.log(queryResult))
		.catch(err => {
			log.error(err.stack)
			console.log(err.message)
		})
	res.send(Object.assign(data, err.message))
}

saveRequest = async (access_token, data, error_code) => {
	return db.addRequest(access_token, JSON.stringify(data), error_code)
		.then(res => {
			console.log(res)
			return true
		})
		.catch(err => {
			log.error(err.stack)
			console.log(err.message)
			return false
		})
}

app.use(/\/plugin\/.*/, async (req, res, next) => {
	auth = await db.authorized((req.body || req.query).access_token, req.baseUrl.split('/')[2])
	if (!auth) {
		msg = 'not authorized query, access_token: ' + (req.body || req.query).access_token
		log.trace(msg)
		console.log(msg)
		res.send({code: 1, message: 'not authorized'})
		return
	}
	res.return = result => {
		try {
			result.save = result.save || {}
			errInfo = result.error ?
				{code: 1, message: result.error.message} :
				{code: 0, message: 'success'}
			saveRequest((req.body || req.query).access_token, result.save, errInfo.code)
			if (errInfo.code) {
				log.error(result.error.stack)
				console.error(result.error.message)
				res.send(errInfo)
				return
			}
			res.send(Object.assign(errInfo, result.response))
		} catch (error) {
			console.error(error.message)
			res.send({code: 1, message: error.message})
		}
	}
	next()
})

module.exports = { app, send }
