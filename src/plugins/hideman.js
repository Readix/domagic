const { app, send } = require('../app-base')
const log = require('../logger')
const db = require('../db')
const api = require('../api')

// Переделать логику потом, oauth на каждый плагин
app.get('/oauth_hideman', async (req, res) => {
	console.log('start auth...')
	let secret = await db.getSecret('hideman')
	if (!secret) {
		let msg = 'Not found client secret in database for stickerman'
		log.error(msg)
		console.error(msg)
	}
	const response = await api.oauth.getToken('hideman', req.query.code, req.query.client_id, secret.client_secret)
	console.log('/oauth/ response = ', response)
	if (response) {
		await db.addAuthorization(response, req.query.client_id)
	}
	res.send('App has been installed, open <br>response: ' + JSON.stringify(response))
})
