$(document).ready(()=>{
	$('#send').click(async () => {
		$('input[type=radio]').prop('disabled', true);
		$('#send').fadeOut()
		$('.loader').fadeIn()

		let stickers = await miro.board.selection.get()
		$.ajax({
			url: '/stickerComposer',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			data: {
				user: window.user_id,
				team: window.team_id,
				criterion: $('input[name=criterion]:checked').val(),
				composition: $('input[name=composition]:checked').val(),
				stickers: stickers
				/*.map((stick) => {
					return {
						id: stick.id,
						width: stick.bounds.width,
						height: stick.bounds.height,
						left: stick.bounds.left,
						top: stick.bounds.top,
						color: stick.style.stickerBackgroundColor
					}
				})*/
			},
			success: (res) => {
				if (Number(res.code) == 1) {
					showErrorNotification('server error')
					console.log(res.message)
					return
				}
				let left = Math.min(...stickers.map(s => s.x))
				let top = Math.min(...stickers.map(s => s.y))
				res.widgets.forEach(widget => {
					widget.x += left;
					widget.y += top
				})
				miro.board.widgets.update(res.widgets);
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