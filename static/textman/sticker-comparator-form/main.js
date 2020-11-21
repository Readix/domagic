let markTag = (cat, event, label, val = 10) => {
	gtag('event', event, {
		'event_category': cat,
		'event_label': label,
		'value': val
	})
	console.log('MARK')
}
let transformWidgetFields = widget => {
	// Transform from server format to miro format
	widget.style = widget.style ? widget.style : {}
	if (widget.type.toLowerCase() == 'sticker') {
		widget.style.stickerBackgroundColor = widget.color
	}
	else {
		widget.style.backgroundColor = widget.color
	}
	delete widget.color
}
$(document).ready(()=>{
	miro.onReady(async () => {
		miro.currentUser.getId().then(user_id =>
			gtag('set', {'user_id': user_id}))
		let widgets = await miro.board.selection.get()
		markTag('TextMan', 'use', widgets.length, 50)
		let timeStart = Date.now()
		$('#send').click(async () => {
			$('input[type=radio]').prop('disabled', true);
			if($('input[value=text]').is(':checked')){
				crit = 'text' + prompt('enter algorithm number (1-3)', '1')
				countGroups = prompt('enter count groups (if you need auto mode - press "ok")')
				if(isNaN(countGroups) == false)
					crit += '-' + countGroups
			}else
				crit = $('input[name=criterion]:checked').val()
			$('#send').fadeOut()
			$('.loader').fadeIn()

			markTag('TextMan', 'group_by', $('input[name=criterion]:checked').val(), 50)
			markTag('TextMan', 'do_magic', (Date.now() - timeStart) / 1000, 50)
			$.ajax({
				url: '/plugin/textman/clusterize',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: JSON.stringify({
					access_token: await miro.getToken(),
					criterion: $('input[name=criterion]:checked').val(),
					widgets: widgets
						.map((widget) => {
							return {
								id: widget.id,
								width: widget.bounds.width,
								height: widget.bounds.height,
								left: widget.bounds.left,
								top: widget.bounds.top,
								color: widget.type.toLowerCase() == 'sticker' ? widget.style.stickerBackgroundColor : widget.style.backgroundColor,
								text: widget.plainText,
								type: widget.type.toLowerCase()
							}
						})
				}),
				success: (res) => {
					console.log('From textman:')
					res.widgets.forEach(w => console.log(w.x))
					if (Number(res.code) == 1) {
						miro.showErrorNotification('Server error, please, try again later')
						console.log(res.message)
						miro.board.ui.closeModal()
						return
					}
					let left = Math.min(...widgets.map(s => s.x))
					let top = Math.min(...widgets.map(s => s.y))
					let promises = []
					res.widgets.forEach(widget => {
						// shift to old area on board
						widget.x += left
						widget.y += top
						// curState = widgets.find((elem) => {
						// 	return elem.id == widget.id
						// })
						transformWidgetFields(widget)
						if (widget.type == '') widget.type = 'sticker'
						if (widget.id == '') {
							let promise = miro.board.widgets.create({type: widget.type, text: widget.text}).then(newWidgets => {
								widget.id = newWidgets[0].id
								miro.board.widgets.update(widget)
							})
							promises.push(promise)
						}
						else {
							miro.board.widgets.update(widget)
							// miro.board.widgets.transformDelta(widget.id, widget.x - curState.bounds.x, widget.y - curState.bounds.y)
						}
					})
					Promise.all(promises).then(_ => {
						miro.board.ui.closeModal()
					})
					// if (!res.isRated) {
					// 	miro.board.ui.openBottomPanel('/static/textman/feedback-form', {'width': 324, 'height': 108})
					// }
				},
				error: () => {
					$('.loader').fadeOut()
					$('#send').fadeIn()
					$('input[type=radio]').prop('disabled', false);
					miro.showNotification('Server error, please, try again later')
				}
			})
		})
	})
})
