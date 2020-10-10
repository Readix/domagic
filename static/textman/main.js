let icon = `<g id="slidermanico-layer">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.8535 7.67685L11.396 9.39758L21.1468 23.3232L23.6043 21.6024L13.8535 7.67685ZM13.6079 9.06958L12.7887 9.64316L14.5095 12.1006L15.3286 11.527L13.6079 9.06958Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 1H23V8H16.5211L14.3444 4.8914L14 5.13256V1ZM18 3H19V4H18V3ZM20 4H19V5H18V6H19V5H20V6H21V5H20V4ZM20 4V3H21V4H20Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 1H11V7.23318L8.61035 8.90643L10.7765 12H1V1ZM4 5H5V6H4V5ZM6 6H5V7H4V8H5V7H6V8H7V7H6V6ZM6 6V5H7V6H6Z" fill="#F0FF00"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.8771 15H1V23H16V19.4599L12.8771 15ZM8 18H9V19H8V18ZM10 19H9V20H8V21H9V20H10V21H11V20H10V19ZM10 19V18H11V19H10Z" fill="#37335F"/>
</g>`
let markTag = (cat, event, label, val = 10) => {
	gtag('event', event, {
		'event_category': cat,
		'event_label': label,
		'value': val
	})
	console.log('MARK')
}
let composeTimes = []
let doMonitor = true
let monitor = () => {
	if (!doMonitor) return
	composeTimes.push(Date.now())
	if (composeTimes.length < 5) return
	let diff = (composeTimes[4] - composeTimes[0]) / 1000
	if (diff <= 20 * 60) {
		markTag('StickerMan', 'use_often', Math.round(diff / 60) + 1, 500)
		doMonitor = false
	} else {
		composeTimes = composeTimes.slice(1)
	}
}
miro.onReady(async () => {
	miro.currentUser.getId().then(user_id =>
		gtag('set', {'user_id': user_id}))
	markTag('StickerMan', 'available', 'true', 10)
	miro.initialize({
		extensionPoints: {
			getWidgetMenuItems: (widgets) => {
				if (widgets.length > 1 && widgets.some((widget) => widget.type.toLowerCase() != 'sticker' && widget.type.toLowerCase() != 'shape') == false){
					return Promise.resolve([{
						tooltip: 'Textman (united)',
						svgIcon: icon,
						onClick: () => {
							monitor()
							miro.board.ui.openModal('/static/stickerman/sticker-comparator-form', {'width':200, 'height':306})
						}
					}])
				}
				return Promise.resolve([{}])
			}
		}
	})
	Object.defineProperty(window, 'team_id', {
		value: (await miro.account.get())['id'],
		configurable: false,
		writable: false
	})
	Object.defineProperty(window, 'user_id', {
		value: await miro.currentUser.getId(),
		configurable: false,
		writable: false
	})
	$.ajax({
		url: '/user/startSession',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: JSON.stringify({
			access_token: await miro.getToken()
		})
	})
})

window.addEventListener("beforeunload", async function (e) {
	await $.ajax({
		url: '/user/endSession',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: JSON.stringify({
			access_token: await miro.getToken()
		})
	})
});