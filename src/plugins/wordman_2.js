const { app, send } = require('../app-base')
const log = require('../logger')
const db = require('../db')

app.get('/views/wordman_2/dice_lib', async (req, res) => {
	// try{
        res.render('wordman_2/dice_lib', {
			pluginName: "pluginName"
		})
		console.log('compose')
	// 	req.body.widgets = Object.values(req.body.widgets)
	// 	let skins = req.body.widgets.map(widget => new CustomWidget(widget))
	// 	let sm = new Stickerman()
	// 	let setts = Object.assign(
	// 		{ clustering: [req.body.criterion.toLowerCase()] },
	// 		settings[req.body.criterion.toLocaleLowerCase()]
	// 	)
	// 	let isRated = await db.isRated(req.body.access_token)
	// 	await sm.run(skins, setts)
	// 	widgets = sm.getWidgets()
	// 	res.return({
	// 		response: {
	// 			code: 0,
	// 			message: 'Success',
	// 			widgets: widgets, 
	// 			isRated: isRated
	// 		}
	// 	})
	// }
	// catch (error) {
	// 	res.return({
	// 		error: error
	// 	})
	// }
})