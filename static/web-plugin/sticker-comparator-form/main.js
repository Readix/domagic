$(document).ready(()=>{
miro.onReady(async () => {
    miro.currentUser.getId().then(user_id =>
        gtag('set', {'user_id': user_id}))
	let markTag = (cat, event, label, val = 10) => {
		gtag('event', event, {
			'event_category': cat,
			'event_label': label,
			'value': val
		});
	}
	$('#send').click(async () => {
		$('input[type=radio]').prop('disabled', true);
		$('#send').fadeOut()
		$('.loader').fadeIn()

		let widgets = await miro.board.selection.get()
		markTag('Компановка', 'Кол-во виджетов', widgets.length)
		markTag('Компановка', 'Критерий', crit)
		markTag('Компановка', 'Вид', $('input[name=composition]:checked').val())
		$.ajax({
			url: '/widgetComposer',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				user: (await miro.account.get())['id'],
				team: await miro.currentUser.getId(),
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
						text: widget.plainText
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
				})
				miro.board.ui.closeModal()
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