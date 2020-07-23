let icon = `<g id="slidermanico-layer">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.8535 7.67685L11.396 9.39758L21.1468 23.3232L23.6043 21.6024L13.8535 7.67685ZM13.6079 9.06958L12.7887 9.64316L14.5095 12.1006L15.3286 11.527L13.6079 9.06958Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 1H23V8H16.5211L14.3444 4.8914L14 5.13256V1ZM18 3H19V4H18V3ZM20 4H19V5H18V6H19V5H20V6H21V5H20V4ZM20 4V3H21V4H20Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 1H11V7.23318L8.61035 8.90643L10.7765 12H1V1ZM4 5H5V6H4V5ZM6 6H5V7H4V8H5V7H6V8H7V7H6V6ZM6 6V5H7V6H6Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.8771 15H1V23H16V19.4599L12.8771 15ZM8 18H9V19H8V18ZM10 19H9V20H8V21H9V20H10V21H11V20H10V19ZM10 19V18H11V19H10Z" fill="#37335F"/>
</g>`

const app_id = "3074457348265940649"

miro.onReady(async () => {
	miro.currentUser.getId().then(user_id =>
    gtag('set', {'user_id': user_id}))
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
	miro.initialize({
		extensionPoints: {
			getWidgetMenuItems: function(widgets) {
        return Promise.resolve([{
          tooltip: 'Hide widgets',
          svgIcon: icon,
          onClick: function() {
            widgets = widgets.map(function(widget) {
              if (widget.metadata[app_id])
                if (widget.metadata[app_id]['HiddenBy'])
                  widget.metadata[app_id] = {}
                else
                  widget.metadata[app_id]['HiddenBy'] = window.user_id
              else {
                widget.metadata[app_id] = {}
                widget.metadata[app_id]['HiddenBy'] = window.user_id
              }
              return widget
            })
            miro.board.widgets.update(widgets)
          }
        }])
			}
		}
	})
  $.ajax({
      url: '/startSession',
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      },
      data: {
          user_id: user_id,
          team_id: team_id
      }
  })
  // test()
  // miro.addListener('METADATA_CHANGED', async (e) => {
  //   console.log(e.data)
  //   curId = await miro.currentUser.getId()
  //   changedWidgets = e.data
  //   changedWidgets.forEach(function(widget) {
  //     if (widget.metadata[app_id] && widget.metadata[app_id]['HiddenBy'] && curId != widget.metadata[app_id]['HiddenBy'])
  //       miro.board.widgets.update({id: widget.id, clientVisible: false})
  //     else
  //       miro.board.widgets.update({id: widget.id, clientVisible: true})
  //   })
  // })
})

async function test() {
  curId = await miro.currentUser.getId()
  widgets = await miro.board.widgets.get()
  widgets.forEach((widget) => {
    if (widget.metadata[app_id] && widget.metadata[app_id]['HiddenBy'] && curId != widget.metadata[app_id]['HiddenBy']) {
      // console.log('hide on start widget: ' + widget.id)
      miro.board.widgets.update({id: widget.id, clientVisible: false})
    }else
      miro.board.widgets.update({id: widget.id, clientVisible: true})
  })
  setTimeout(test, 1000)
}

window.addEventListener("beforeunload", async function (e) {
  await $.ajax({
    url: '/endSession',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
      user_id: user_id,
      team_id: team_id
    }
  })
});