$(document).ready(()=> {
	miro.onReady(async () => {
		miro.currentUser.getId().then(user_id =>
			gtag('set', {'user_id': user_id}))
			return Promise.resolve([{}])
		}
	)
	$('.rate-option').click(function() {
		$('.rate-option--checked').removeClass("rate-option--checked");
		$(this).addClass("rate-option--checked");
		$('.rate-comment-form').css("display", "block");

		miro.board.ui.resizeTo('.board-panel--hidden-bottom', {'width':324, 'height':306});

	});
	$('textarea').on('input', function () {
		this.style.height = 'auto';
		this.style.height =
			(this.scrollHeight) + 'px';
	});
	$('.board-panel--hidden-bottom').css("height" ,"184.636px");
	$('.rate-wrapper').css("height" ,"184.636px");
	$('button').click(function() {
		$('.board-panel--hidden-bottom').fadeOut(100);
		miro.board.ui.closeBottomPanel();
		return Promise.resolve([{}])
	});

})



