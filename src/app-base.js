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

//Будет не нужно
var pluginProps = []
db.getPluginProps(config.PLUGIN_NAME).then((props) => {
	console.log(props)
	pluginProps = props
})
// Не нужно для плагина (можно будет лендос сюда закинуть или чтото такое) 
app.get('/', (req, res) => {
	res.render('index', {
		baseUrl: config.BASE_URL,
		oauthUrl: `https://miro.com/oauth/authorize?response_type=code\
			&client_id=${pluginProps.client_id}&redirect_uri=${config.BASE_URL}/oauth` // здесь ...oauth?pay_key=<key>
	})
})

app.get('/startSession', async (req, res) => {
	await db.startSession(req.query.user_id, req.query.team_id)
	res.send('Session started successfully')
})

app.get('/endSession', async (req, res) => {
	await db.endSession(req.query.user_id, req.query.team_id)
	res.send('Session ended successfully')
})

// app.listen(port, () => {
// 	db.init()
// 	console.log(`App listening on port ${port}`)
// })

// Шаблонизировать, если понадобится
send = (user, team, response, info, sendData, reqData) => {
	db.addRequest(user, team, JSON.stringify(reqData), info.code)
	response.send(Object.assign(sendData, info))
}

module.exports = { app, send }
