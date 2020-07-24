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
	miro.initialize({
		extensionPoints: {
			getWidgetMenuItems: function(widgets) {
        return Promise.resolve([{
          tooltip: 'Hide widgets',
          svgIcon: icon,
          onClick: async function() {
            widgets = await miro.board.selection.get()
            widgets.forEach((widget) => {
              switch(widget.type){
                case 'SHAPE':
                  if (typeof(widget.metadata[app_id]) == 'object'){
                    widget.style.backgroundColor = widget.metadata[app_id].style.backgroundColor
                    widget.style.backgroundOpacity = widget.metadata[app_id].style.backgroundOpacity
                    widget.style.bold = widget.metadata[app_id].style.bold
                    widget.style.borderColor = widget.metadata[app_id].style.borderColor
                    widget.style.borderOpacity = widget.metadata[app_id].style.borderOpacity
                    widget.style.fontFamily = widget.metadata[app_id].style.fontFamily
                    widget.style.highlighting = widget.metadata[app_id].style.highlighting
                    widget.style.italic = widget.metadata[app_id].style.italic
                    widget.style.strike = widget.metadata[app_id].style.strike
                    widget.style.textAlign = widget.metadata[app_id].style.textAlign
                    widget.style.textAlignVertical = widget.metadata[app_id].style.textAlignVertical
                    widget.style.textColor = widget.metadata[app_id].style.textColor
                    widget.style.underline = widget.metadata[app_id].style.underline
                    widget.text = widget.metadata[app_id].text
                    widget.capabilities.editable = true
                    widget.metadata[app_id] = undefined
                  }else{
                    widget.metadata[app_id] = {
                      text: widget.text,
                      style: {
                        backgroundColor: widget.style.backgroundColor,
                        backgroundOpacity: widget.style.backgroundOpacity,
                        bold: widget.style.bold,
                        borderColor: widget.style.borderColor,
                        borderOpacity: widget.style.borderOpacity,
                        fontFamily: widget.style.fontFamily,
                        highlighting: widget.style.highlighting,
                        italic: widget.style.italic,
                        strike: widget.style.strike,
                        textAlign: widget.style.textAlign,
                        textAlignVertical: widget.style.textAlignVertical,
                        textColor: widget.style.textColor,
                        underline: widget.style.underline
                      }
                    }
                    widget.style.backgroundColor = '#aba18f'
                    widget.style.backgroundOpacity = 1
                    widget.style.bold = 0
                    widget.style.borderColor = "transparent"
                    widget.style.borderOpacity = 1
                    widget.style.fontFamily = 10
                    widget.style.highlighting = 0
                    widget.style.italic = 0
                    widget.style.strike = 0
                    widget.style.textAlign = 'c'
                    widget.style.textAlignVertical = 'm'
                    widget.style.textColor = "#000000"
                    widget.style.underline = 0
                    widget.text = '<p>Content hidden</p>'
                    widget.capabilities.editable = false
                  }
                  break;
                case 'STICKER':
                  if (typeof(widget.metadata[app_id]) == 'object'){
                    widget.style.stickerBackgroundColor = widget.metadata[app_id].style.stickerBackgroundColor
                    widget.text = widget.metadata[app_id].text
                    widget.capabilities.editable = true
                    widget.style.textAlign = widget.metadata[app_id].style.textAlign
                    widget.style.textAlignVertical = widget.metadata[app_id].style.textAlignVertical
                    widget.metadata[app_id] = undefined
                  }else{
                    widget.metadata[app_id] = {
                      text: widget.text,
                      style: {
                        stickerBackgroundColor: widget.style.stickerBackgroundColor,
                        textAlign: widget.style.textAlign,
                        textAlignVertical: widget.style.textAlignVertical
                      }
                    }
                    widget.style.stickerBackgroundColor = '#aba18f'
                    widget.text = '<p>Content hidden</p>'
                    widget.capabilities.editable = false
                    widget.style.textAlign = 'c'
                    widget.style.textAlignVertical = 'm'
                  }
                  break;
                default:
                  break;
              }
            })
            miro.board.widgets.update(widgets)
          }
        }])
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
})

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