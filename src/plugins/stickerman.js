const { app, send } = require('../app-base')
const log = require('../logger')
const db = require('../db')
const api = require('../api')

const MiroWidget = require('../../stickerman/miroWidget')
const CustomWidget = require('../../stickerman/customWidget')
const Stickerman = require('../../stickerman/stickerman')


let settings = {
	horizontal: {
		order: { values: ['height', 'width'], desc: true },
		compose: ['horizontal', 'vertical']
	},
	vertical: {
		order: { values: ['width', 'height'], desc: true },
		compose: ['vertical', 'horizontal']
	},
	blocky: {
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

app.post('/plugin/stickerman/widgetComposer', async (req, res) => {
	try{
		console.log('compose')
		req.body.widgets = Object.values(req.body.widgets)
		let skins = req.body.widgets.map(widget => new CustomWidget(widget))
		let sm = new Stickerman()
		let setts = Object.assign(
			{ clustering: [req.body.criterion.toLowerCase()] },
			settings[req.body.composition.toLocaleLowerCase()]
		)
		let isRated = await db.isRated(req.body.access_token)
		await sm.run(skins, setts)
		res.return({
			response: {
				code: 0,
				message: 'Success',
				widgets: req.body.widgets, 
				isRated: isRated
			}
		})
	}
	catch (error) {
		res.return({
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
