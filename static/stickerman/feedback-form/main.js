/**
 * Метод /rate устарел, обновить модуль когда функционал /rate будет восстановлен
 */

let _gradesEnum = {Awful: -2, Bad: -1, Neutral: 0, Good: 1, Awesome: 2}
$(document).ready(() => {

		$('.rate-option').click(function() {
			$('.rate-option--checked').removeClass('rate-option--checked')
			$(this).addClass('rate-option--checked')
			$('.rate-comment-form').css('display', 'block')
			$('.board-panel--hidden-bottom').css('height', '184.636px')
			$('.rate-wrapper').css('height', '184.636px')
			miro.board.ui.resizeTo('.board-panel--hidden-bottom', {'height': 184.636})
		})

		$('.closeBtn').click(function() {
			$('.board-panel--hidden-bottom').fadeOut(100)
			miro.board.ui.closeBottomPanel()
		})

		$('.rtb-btn').click(async function() {
			let grade
			switch ($('label.rate-option--checked').attr('title')) {
				case 'Awful':  // if (x === 'value1')
					grade = _gradesEnum.Awful
					break
				case 'Bad':  // if (x === 'value2')
					grade = _gradesEnum.Bad
					break
				case 'Neutral':  // if (x === 'value2')
					grade = _gradesEnum.Neutral
					break
				case 'Good':  // if (x === 'value2')
					grade = _gradesEnum.Good
					break
				case 'Awesome':  // if (x === 'value2')
					grade = _gradesEnum.Awesome
					break
				default:
					grade = null
					break
			}
			$.ajax({
				url: '/rate',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: JSON.stringify({
					grade: grade,
					comment: $('textarea').val()
				}),
				success: (res) => {
					$('.board-panel--hidden-bottom').fadeOut(100);
					miro.showNotification('Thanks for your feedback');
					miro.board.ui.closeBottomPanel();
				},
				error: () => {
					$('.board-panel--hidden-bottom').fadeOut(100);
					miro.showNotification('Server error, please, try again later');
					miro.board.ui.closeBottomPanel();
				}
			})
		})
})





