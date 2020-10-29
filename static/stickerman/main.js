let icon = `<g id="slidermanico-layer">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.8535 7.67685L11.396 9.39758L21.1468 23.3232L23.6043 21.6024L13.8535 7.67685ZM13.6079 9.06958L12.7887 9.64316L14.5095 12.1006L15.3286 11.527L13.6079 9.06958Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 1H23V8H16.5211L14.3444 4.8914L14 5.13256V1ZM18 3H19V4H18V3ZM20 4H19V5H18V6H19V5H20V6H21V5H20V4ZM20 4V3H21V4H20Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 1H11V7.23318L8.61035 8.90643L10.7765 12H1V1ZM4 5H5V6H4V5ZM6 6H5V7H4V8H5V7H6V8H7V7H6V6ZM6 6V5H7V6H6Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.8771 15H1V23H16V19.4599L12.8771 15ZM8 18H9V19H8V18ZM10 19H9V20H8V21H9V20H10V21H11V20H10V19ZM10 19V18H11V19H10Z" fill="#37335F"/>
</g>`
let tooltipLabel = 'Align'
let isAuth = async () => {
  return await $.ajax({
    url: '/plugin/stickerman/auth',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      access_token: await miro.getToken()
    }
  }).then(res => {
  	switch(parseInt(res.code / 100)){
  		case 2: 
  		    miro.showErrorNotification(res.message);
  		    return false;
  		case 1:     
  		    miro.showNotification(res.message);
  		    return true;
  		default: return true;
  	}
  }, () => {
    miro.showErrorNotification('Server error, please, try again later');
    return false;
  })
}
let authResponse = {code: 201, message: 'Something goes wrong, try again later'}

gah.wait(5, 20 * 60, () => gah.event('StickerMan', 'use_often', '', 500))
miro.onReady(async () => {
  isAuth().then(res => {authResponse = res})
	miro.currentUser.getId().then(user_id =>
    gah.setUser(user_id))
  gah.event('StickerMan', 'available', 'true', 10)
	miro.initialize({
		extensionPoints: {
			getWidgetMenuItems: (widgets) => {
				if (widgets.length > 1 && widgets.some((widget) => widget.type.toLowerCase() != 'sticker' && widget.type.toLowerCase() != 'shape') == false){
					return Promise.resolve([{
						tooltip: tooltipLabel,
						svgIcon: icon,
						onClick: () => {
              gah.pin()
              switch(parseInt(authResponse.code / 100)){
                case 5:
                  miro.showErrorNotification(authResponse.message);
                  return;
                case 2: 
                  miro.showErrorNotification(authResponse.message);
                  return;
                case 1:
                  miro.showNotification(authResponse.message);
              }
              miro.board.ui.openModal('/static/stickerman/sticker-comparator-form', {'width':200, 'height':306})
            }
          }])
				}
				return Promise.resolve([])
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