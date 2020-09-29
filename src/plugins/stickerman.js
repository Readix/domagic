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
		saveData = buildSaveData(req.body.widgets)
		req.body.widgets = Object.values(req.body.widgets)
		let skins = req.body.widgets.map(widget => new CustomWidget(widget))
		let sm = new Stickerman()
		let setts = Object.assign(
			{ clustering: [req.body.criterion.toLowerCase()] },
			settings[req.body.composition.toLocaleLowerCase()]
		)

		await sm.run(skins, setts)
		res.return({
			save: saveData,
			response: {widgets: req.body.widgets}
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
		if (typeof  req.body.comment === 'undefined') {
			req.body.comment="undefined";
		}
			await db.addFeedback(req.body.user_id,req.body.team_id,req.body.request_id, req.body.grade, req.body.comment);
			await db.feedbackToRequest(req.body.user_id,req.body.team_id,req.body.request_id);
		res.sendStatus(200);
	}
	catch (error) {
		log.error(error.stack)
		console.error(error.message)
		send(req.body.user, req.body.team, res, {
			code: 1,
			message: error.stack
		}, {}, req.body)
	}
})
