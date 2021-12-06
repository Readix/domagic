const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const exphbs = require('express-handlebars');

const api = require('./api')
const db = require('./db')
const config = require('./config')

const app = express()

const log = require('./logger')

app.engine('hbs', exphbs({
    extname: '.hbs', 
    defaultLayout: false,
    helpers: {
        ifeq: (a, b, options) => a == b ? options.fn(this) : options.inverse(this)
    } 
}));
app.set('view engine', 'hbs');

app.set('views', __dirname + '/../views')

app.use(cors())
app.use('/static', express.static('static'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const makeRedirectUri = (baseUrl, pluginName) =>
    `${baseUrl}/oauth_${pluginName}`

const makeInstallationUrl = (clientId, baseUrl, pluginName) =>
    'https://miro.com/oauth/authorize?response_type=code' +
    `&client_id=${clientId}&redirect_uri=${makeRedirectUri(baseUrl, pluginName)}`

const descriptions = {
    diceman: 'Diceman имитирует игральную кость на доске. Виджет добавляется на доску и показывает картинку с гранью игральной кости от 1 до 6 по клику на иконку, доступную через контекстное меню.',
    hideman: 'Hideman — это плагин, который делает скрытым/видимым контент на стикерах. Управление видимостью будет доступно только создателю стикера. Когда контент на стикере будет скрыт, на нем будет отображаться emoji.',
    stickerman: 'Stickerman кластеризует стикеры и фигуры по цвету и размеру, расставляя их по горизонтали, вертикали или в блоках.',
}

app.get('/', (req, res) => {
	const config = require('./config.js')
	const pluginsInfo = config.PLUGINS.map(pluginName => {
        return db.getPluginProps(pluginName).then(props => {
            try {
                const href = makeInstallationUrl(props.client_id, config.BASE_URL, pluginName)
                const nameWithCapitalLetter = pluginName.charAt(0).toUpperCase() + pluginName.slice(1)
                return {
                    name: pluginName,
                    publicName: nameWithCapitalLetter,
                    link: href,
                    description: descriptions[pluginName.toLowerCase()]
                }
            } catch (error) {
                console.log(`Ошибка при извлечении информации о плагине из БД. Plugin name = ${pluginName}`)
                return undefined
            }
        })
	})

	Promise.all(pluginsInfo).then(plugins => {
        plugins = plugins.filter(pluginInfo => pluginInfo != undefined)
        res.render('landing', { plugins })
	})
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

/**
 * Метод устарел
 * TODO: JWT
 */
app.post('/user/startSession', async (req, res) => {
	try {
        console.log('\x1b[33m', 'Используется устаревший метод: startSession', '\x1b[0m')
		res.send({code: 0, message: 'Session started successfully'})

		// auth = await db.authorized(req.body.access_token)
		// if (!auth) {
		// 	msg = req.originalUrl + ': not authorized query, access_token: ' +
		// 		req.body.access_token
		// 	log.trace(msg)
		// 	console.log(msg)
		// 	res.send({code: 1, message: 'not authorized'})
		// 	return
		// }
		// await db.startSession(req.body.access_token)
		// res.send({code: 0, message: 'Session started successfully'})
	} catch (error) {
		log.error(err.stack)
		console.error(error.message)
		res.send({code: 1, message: error.message})
	}
})

/**
 * Метод устарел
 * TODO: JWT
 */
app.post('/user/endSession', async (req, res) => {
	try {
        console.log('\x1b[33m', 'Используется устаревший метод: endSession', '\x1b[0m')
		res.send({code: 0, message: 'Session ended successfully'})

		// auth = await db.authorized(req.body.access_token)
		// if (!auth) {
		// 	msg = req.originalUrl + ': not authorized query, access_token: ' +
		// 		req.body.access_token
		// 	log.trace(msg)
		// 	console.log(msg)
		// 	res.send({code: 1, message: 'not authorized'})
		// 	return
		// }
		// await db.endSession(req.body.access_token)
		// res.send({code: 0, message: 'Session ended successfully'})
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

app.get('/redirect_uri', async (req, res) => {
    const pluginName = req.query.plugin_name.toLowerCase()
    if (config.PLUGINS.indexOf(pluginName) < 0) {
        res.status(404)
        res.send({ error: true, message: `Plugin ${pluginName} not found` })
        return
    }
    const redirect_uri = makeRedirectUri(config.BASE_URL, pluginName)
    res.send({ redirect_uri })
})

app.use(/\/plugin\/.*/, async (req, res, next) => {
	try {
        /** Miro изменили авторизацию, она теперь работает по JWT */

		// switch (req.method.toLowerCase()) {
		// 	case 'get': 
		// 		body = req.query; 
		// 		break;
		// 	case 'post': 
		// 		body = req.body; 
		// 		break;
		// 	default: throw new Error('Unknown query method type')
		// }
		// auth = await db.authorized(body.access_token, req.originalUrl.split('/')[2])
		// if (!auth) {
		// 	msg = req.originalUrl + ': not authorized query, access_token: ' +
		// 		body.access_token
		// 	log.trace(msg)
		// 	console.log(msg)
		// 	res.send({code: 201, message: 'Not authorized'})
		// 	return
		// }
		res.return = result => {
			try {
				code = result.error ? 500 : result.response.code
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
