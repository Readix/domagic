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
				stickers: stickers.map((stick) => {
					return {
						id: stick.id,
						width: stick.bounds.width,
						height: stick.bounds.height,
						left: stick.bounds.left,
						top: stick.bounds.top,
						color: stick.style.stickerBackgroundColor
					}
				})
			},
			success: (res) => {
				// #todo: placing sticks code (example is below)
				// gtag('event', 'Код ошибки', {
				// 	'event_category': 'Генерация',
				// 	'event_label': `${res.code}`,
				// 	'value': 10
				// });
				// switch (parseInt(res.code / 100)) {
				// 	case 1:
				// 		miro.showNotification(res.message)
				// 		break
				// 	case 2:
				// 		miro.showErrorNotification(res.message)
				// 		return
				// 	case 3:
				// 		miro.showErrorNotification('server error')
				// 		return
				// }
				// objectsToUpdate = []
				// res.stickers.forEach(element => {
				// object = stickers.find(object => object.id == element.id);
				// object.x = element.area.leftTop.x + frame[0].bounds.left + element.width/2;
				// object.y = element.area.leftTop.y + frame[0].bounds.top + element.height/2;
				// objectsToUpdate.push(object)
				// });
				// miro.board.widgets.update(objectsToUpdate);
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