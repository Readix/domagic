const { app, send } = require('../app-base')
const log = require('../logger')
const db = require('../db')
const api = require('../api')

const MiroWidget = require('../../stickerman/miroWidget')
const CustomWidget = require('../../stickerman/customWidget')
const Stickerman = require('../../stickerman/stickerman')
const { count } = require('console')


let settings = {
	keywords: {
		order: { values: ['none', 'width'], desc: true },
		compose: ['blocky_keygroup', 'horizontal']
	},
	tonality: {
		order: { values: ['width', 'width'], desc: true},
		compose: ['blocky', 'blocky']
	}
}

let buildSaveData = widgets => {
	let saveData = {}
	widgets.forEach(widget => {
		saveData[widget.type] = (saveData[widget.type] + 1) || 1
	})
	return saveData
}

app.post('/plugin/textman/clusterize', async (req, res) => {
	try{
		console.log('compose')
		saveData = buildSaveData(req.body.widgets)
		req.body.widgets = Object.values(req.body.widgets)
		let skins = req.body.widgets.map(widget => new CustomWidget(widget))
		let sm = new Stickerman()
		let setts = Object.assign(
			{ clustering: [req.body.criterion.toLowerCase()] },
			settings[req.body.criterion.toLocaleLowerCase()]
		)
		let isRated = await db.isRated(req.body.access_token)
		await sm.run(skins, setts)
		widgets = sm.getWidgets()
		res.return({
			save: saveData,
			response: {
				code: 0,
				message: 'Success',
				widgets: widgets, 
				isRated: isRated
			}
		})
	}
	catch (error) {
		res.return({
			save: saveData,
			error: error
		})
	}
})

app.post('/rate', async (req, res) => {
	try{
		if ((typeof  req.body.grade === 'undefined') && (typeof  req.body.comment === 'undefined')) {
			await db.addFeedback(req.body.access_token, false, null, null);
		}
		else if (typeof  req.body.comment === 'undefined') {
			await db.addFeedback(req.body.access_token, true, req.body.grade, null);
		}
		else {
			await db.addFeedback(req.body.access_token, true, req.body.grade, req.body.comment);
		}
		res.sendStatus(202);
	}
	catch (error) {
		log.error(error.stack)
		console.error(error.message)
		res.sendStatus(500);
	}
})
