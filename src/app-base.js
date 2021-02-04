const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const exphbs = require('express-handlebars');

const api = require('./api')
const db = require('./db')
const config = require('./config')

const app = express()

const log = require('./logger')

app.engine('hbs', exphbs({extname: '.hbs', defaultLayout: false}));
app.set('view engine', 'hbs');

app.set('views', __dirname + '/../views')

app.use(cors())
app.use('/static', express.static('static'))
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

// For pay links (dev)
var pass = 'f4574473-6290-4aa8-b5c9-8dc39e4aaf14';
app.get('/pay_links', (req, res) => {
	if (req.query.pass != pass) {
		res.send('No access'); 
	}
	const config = require('./config.js')
	let getLinks = []
	config.PLUGINS.map(pluginName => {
		let getLink = db.getPluginProps(pluginName).then(props => {
			let href = `${config.BASE_URL}/genlink/${pluginName}?pass=${pass}`;//
			return {name: pluginName, link: href}//`${pluginName}: <a href="${href}">install</a>`
		})
		getLinks.push(getLink)
	})
	Promise.all(getLinks).then(plugins => {
		plugins = plugins.map(plugin => {
			return `<span>${plugin.name}</span>
			<a href="${plugin.link}" class="btn btn-primary btn-lg active" role="button" aria-pressed="true">Сгенерировать уникальную ссылку</a>
			<br>`
		}).join('');
		res.send(plugins);
	})
})

app.post('/user/startSession', async (req, res) => {
	try {
		auth = await db.authorized(req.body.access_token)
		if (!auth) {
			msg = req.originalUrl + ': not authorized query, access_token: ' +
				req.body.access_token
			log.trace(msg)
			console.log(msg)
			res.send({code: 1, message: 'not authorized'})
			return
		}
		await db.startSession(req.body.access_token)
		res.send({code: 0, message: 'Session started successfully'})
	} catch (error) {
		log.error(err.stack)
		console.error(error.message)
		res.send({code: 1, message: error.message})
	}
})

app.post('/user/endSession', async (req, res) => {
	try {
		auth = await db.authorized(req.body.access_token)
		if (!auth) {
			msg = req.originalUrl + ': not authorized query, access_token: ' +
				req.body.access_token
			log.trace(msg)
			console.log(msg)
			res.send({code: 1, message: 'not authorized'})
			return
		}
		await db.endSession(req.body.access_token)
		res.send({code: 0, message: 'Session ended successfully'})
	} catch (error) {
		log.error(error.stack)
		console.error(error.message)
		res.send({code: 1, message: error.message})
	}
})

// Функция устаревшая, но пока что используется в /rate
send = async (access_token, response, info, sendData, reqData) => {
	let queryResult= await db.addRequest(access_token, JSON.stringify(reqData), info.code)
		.catch(err =>
			console.log(err.message))
	console.log(queryResult);
	response.send(Object.assign(sendData, info, queryResult))
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
	try {
		switch (req.method.toLowerCase()) {
			case 'get': 
				body = req.query; 
				break;
			case 'post': 
				body = req.body; 
				break;
			default: throw new Error('Unknown query method type')
		}
		auth = await db.authorized(body.access_token, req.originalUrl.split('/')[2])
		if (!auth) {
			msg = req.originalUrl + ': not authorized query, access_token: ' +
				body.access_token
			log.trace(msg)
			console.log(msg)
			res.send({code: 201, message: 'Not authorized'})
			return
		}
		res.return = result => {
			try {
				code = result.error ? 500 : result.response.code
				if (result.save) {
					saveRequest(body.access_token, result.save, code)
				}
				if (code == 500) {
					log.error(result.error.stack)
					console.error(result.error.message)
					res.sendStatus(500)
					return
				}
				if (!result.response) throw Error('Missing data for response key')
				res.send(Object.assign(result.response))
			} catch (error) {
				console.error(error.message)
				log.error(error.stack)
				// res.send({code: 1, message: error.message})
				res.sendStatus(500)
			}
		}
		next()
	} catch (error) {
		console.error(error.message)
		log.error(error.stack)
		// res.send({code: 1, message: error.message})
		res.sendStatus(500)
	}
})

module.exports = { app, send }
