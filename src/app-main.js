var fs = require('fs');
var config = require('./config.json');
var { app, send } = require('./app-base');
var db = require('./db');
var api = require('./api');
const port = config.port


if (!config.plugins.length)
    throw new Error('Empty plugins list')

config.plugins
	.filter(name => 
		fs.readdirSync('./src/plugins/').indexOf(name + '.js') > -1)
	.forEach(name => require('./plugins/' + name))

config.plugins.forEach(pluginName => {
	app.get('/oauth_' + pluginName, async (req, res) => {
		console.log(pluginName + ': start auth...')
		let secret = await db.getSecret(pluginName)
		if (!secret) {
			let msg = 'Not found client secret in database for ' + pluginName
			log.error(msg)
			console.error(msg)
		}
		const response = await api.oauth.getToken(pluginName, req.query.code, req.query.client_id, secret.client_secret)
		console.log('/oauth/ response = ', response)
		if (response) {
			await db.addAuthorization(response, req.query.client_id)
		}
		res.send(pluginName + ' has been installed, open <br>response: ' + JSON.stringify(response))
	})
})
app.listen(port, () => {
	db.init()
		.then(initMsg => {
			console.log(initMsg)
			console.log(`App listening on port ${port}`)
		})
		.catch(err => console.error(err))
})