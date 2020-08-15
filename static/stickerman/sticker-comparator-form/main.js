let markTag = (cat, event, label, val = 10) => {
	gtag('event', event, {
		'event_category': cat,
		'event_label': label,
		'value': val
	})
	console.log('MARK')
}
$(document).ready(()=>{
miro.onReady(async () => {
    miro.currentUser.getId().then(user_id =>
        gtag('set', {'user_id': user_id}))
	let widgets = await miro.board.selection.get()
	markTag('StickerMan', 'use', widgets.length, 50)
	let timeStart = Date.now()
	$('#send').click(async () => {
		$('input[type=radio]').prop('disabled', true);
		$('#send').fadeOut()
		$('.loader').fadeIn()

		markTag('StickerMan', 'group_by', $('input[name=criterion]:checked').val(), 50)
		markTag('StickerMan', 'composition', $('input[name=composition]:checked').val(), 50)
		markTag('StickerMan', 'do_magic', (Date.now() - timeStart) / 1000, 50)
		$.ajax({
			url: '/plugin/stickerman/widgetComposer',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				access_token: await miro.getToken(),
				criterion: $('input[name=criterion]:checked').val(),
				overparams: $('input[type=text]').val(),
				composition: $('input[name=composition]:checked').val(),
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
				console.log(res)
				//markTag('Компановка', 'Кол-во групп', ...)
				if (Number(res.code) == 1) {
					miro.showErrorNotification('server error')
					console.log(res.message)
					miro.board.ui.closeModal()
					return
				}
				let left = Math.min(...widgets.map(s => s.x))
				let top = Math.min(...widgets.map(s => s.y))
				res.widgets.forEach(widget => {
					widget.x += left
					widget.y += top
					curState = widgets.find((elem) => {
						return elem.id == widget.id
					})
					miro.board.widgets.transformDelta(widget.id, widget.x - curState.bounds.x, widget.y - curState.bounds.y)
					if (crit == 'tonality'){
						data_to_update = {
							id: widget.id,
							style: {}
						}
						if (curState.type.toLowerCase() == 'sticker')
							data_to_update.style.stickerBackgroundColor = widget.color
						else
							data_to_update.style.backgroundColor = widget.color
						miro.board.widgets.update(data_to_update)
					}
				})
				miro.board.ui.closeModal()
				if (!res.isRated) {
					miro.board.ui.openBottomPanel('/static/stickerman/feedback-form', {'width': 324, 'height': 108})
				}
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
