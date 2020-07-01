$(document).ready(()=>{
	$('#send').click(async () => {
		$('input[type=radio]').prop('disabled', true);
		$('#send').fadeOut()
		$('.loader').fadeIn()

		let stickers = await miro.board.selection.get()
		$.ajax({
			url: '/stickerComposer',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				user: window.user_id,
				team: window.team_id,
				criterion: $('input[name=criterion]:checked').val(),
				overparams: $('input[type=text]').val(),
				composition: $('input[name=composition]:checked').val(),
				stickers: stickers
				.map((stick) => {
					return {
						id: stick.id,
						width: stick.bounds.width,
						height: stick.bounds.height,
						left: stick.bounds.left,
						top: stick.bounds.top,
						color: stick.style.stickerBackgroundColor,
						text: stick.plainText
					}
				})
			}),
			success: (res) => {
				console.log(res)
				if (Number(res.code) == 1) {
					miro.showErrorNotification('server error')
					console.log(res.message)
					miro.board.ui.closeModal()
					return
				}
				let left = Math.min(...stickers.map(s => s.x))
				let top = Math.min(...stickers.map(s => s.y))
				res.widgets.forEach(widget => {
					widget.x += left
					widget.y += top
					curState = stickers.find((elem) => {
						return elem.id == widget.id
					})
					miro.board.widgets.transformDelta(widget.id, widget.x - curState.bounds.left, widget.y - curState.bounds.top)
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