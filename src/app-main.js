var fs = require('fs');
var config = require('./config.json');
var { app, send } = require('./app-base');
var db = require('./db');
var api = require('./api');
var admin = require('./admin');
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
		let isPaid = await db.isPaid(pluginName);
		if (isPaid) {
			let available = req.query.state && (await db.availablePaykeyWindow(req.query.state));
			if (!available) {
				res.render('message_page', {
					header: 'Not avialable installation link',
					message: 'The installation link is incorrect or has already been used'
				});
				return;
			}
		}
		const response = await api.oauth.getToken(pluginName, req.query.code, req.query.client_id, secret.client_secret)
		console.log('/oauth/ response = ', response)
		if (response) {
			let installId = await db.addAuthorization(response, req.query.client_id);
			console.log(installId);
			if (isPaid) {
				await db.addPayInstallation(req.query.state, installId);
			}
		}
		res.render('index', {
			pluginName: pluginName
			// baseUrl: config.BASE_URL,
			// oauthUrl: `https://miro.com/oauth/authorize?response_type=code\
			// 	&client_id=${pluginProps.client_id}&redirect_uri=${config.BASE_URL}/oauth` // здесь ...oauth?pay_key=<key>
		})
		// res.send(pluginName + ' has been installed, open <br>response: ' + JSON.stringify(response))
	})
	// Check install for each plugin (use decorator)
	app.get('/plugin/' + pluginName + '/auth', async (req, res) => {
		res.send({code: 0, message: 'Success'})
		// res.sendStatus(500)
	})
})

try {
	admin.initAdminPanel(app);
} catch (error) {
	throw new Error('Admin panel initializing error:\n' + error);
}

app.listen(port, () => {
	db.init()
		.then(initMsg => {
			console.log(initMsg)
			console.log(`App listening on port ${port}`)
		})
		.catch(err => console.error(err))
})