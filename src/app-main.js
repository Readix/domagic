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
	// Registration
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
	// Check install for each plugin (use decorator)
	app.get('/plugin/' + pluginName + '/auth', async (req, res) => {
		res.send({code: 0, message: 'Success'})
		// res.sendStatus(500)
	})
	// Generate ay link
	var pass = 'f4574473-6290-4aa8-b5c9-8dc39e4aaf14'; // @tmp
	app.get('/genlink/' + pluginName, async (req, res) => {
		if(req.query.pass != pass) {// @tmp
			res.send('No access');
		}
		console.log('Generate pay key');
		// let payKey = db.addWindow(pluginName);
		let samplePayKey = 'paykey123'
		const config = require('./config.js')
		db.getPluginProps(pluginName).then(props => {
			let link = 'https://miro.com/oauth/authorize?response_type=code' +
				`&client_id=${props.client_id}&redirect_uri=${config.BASE_URL}/oauth_${pluginName}` +
				`&state=${samplePayKey}`;
			res.send(`<textarea style="width: 100%;" disabled>${link}</textarea>`);		
		})
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