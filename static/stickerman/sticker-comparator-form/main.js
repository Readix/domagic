$(document).ready(()=>{
miro.onReady(async () => {
    miro.currentUser.getId().then(user_id =>
        gah.setUser(user_id))
	let widgets = await miro.board.selection.get()
	gah.event('StickerMan', 'use', widgets.length, 50)
	let timeStart = Date.now()
	$('#send').click(async () => {
		$('input[type=radio]').prop('disabled', true);
		$('#send').fadeOut()
		$('.loader').fadeIn()

		gah.event('StickerMan', 'group_by', $('input[name=criterion]:checked').val(), 50)
		gah.event('StickerMan', 'composition', $('input[name=composition]:checked').val(), 50)
		gah.event('StickerMan', 'do_magic', (Date.now() - timeStart) / 1000, 50)
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
				switch (parseInt(res.code / 100)) {
					case 2:
						miro.showErrorNotification(res.message)
						miro.board.ui.closeModal()
						return;
					case 1:
						miro.showNotification(res.message)
						break;
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
					if ($('input[name=criterion]:checked').val() == 'tonality'){
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