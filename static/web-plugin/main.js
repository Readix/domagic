const pasteIcon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="640" height="640"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="g6H4LGxhB"></path><mask id="maska3pgC8soar" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#g6H4LGxhB" opacity="1" fill="black"></use></mask><path d="M385.51 308.29C385.51 345.05 355.66 374.9 318.9 374.9C282.14 374.9 252.29 345.05 252.29 308.29C252.29 271.53 282.14 241.68 318.9 241.68C355.66 241.68 385.51 271.53 385.51 308.29Z" id="aDHxKg5Fz"></path></defs><g><g><g><g mask="url(#maska3pgC8soar)"><use xlink:href="#g6H4LGxhB" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#aDHxKg5Fz" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="52" stroke-opacity="1"></use></g></g></g></g></svg>`

const rollIcon = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 512.004 512.004" style="enable-background:new 0 0 512.004 512.004;" xml:space="preserve">
<g><g><g>
<path d="M468.975,0.002H341.7c-23.771,0-43.029,19.258-43.029,43.029v127.275c0,23.771,19.258,43.029,43.029,43.029h127.275c23.771,0,43.029-19.258,43.029-43.029V43.031C512.004,19.26,492.746,0.002,468.975,0.002z M469.338,170.306c0,0.207-0.155,0.363-0.363,0.363H341.7c-0.207,0-0.363-0.155-0.363-0.363V43.031c0-0.207,0.155-0.363,0.363-0.363h127.275c0.207,0,0.363,0.155,0.363,0.363V170.306z"/>
<path d="M405.333,85.335c-11.776,0-21.333,9.557-21.333,21.333s9.557,21.333,21.333,21.333s21.333-9.557,21.333-21.333S417.109,85.335,405.333,85.335z"/>
<path d="M399.032,265.921l-54.092,54.073h-28.602c2.373-6.678,3.666-13.859,3.666-21.333c0-35.249-28.751-64-64-64H152.796L128,226.403v-34.401c0-11.782-9.551-21.333-21.333-21.333H21.333C9.551,170.669,0,180.22,0,192.002v298.667c0,11.782,9.551,21.333,21.333,21.333h85.333c11.782,0,21.333-9.551,21.333-21.333v-21.342h127.066c60.397,0,119.538-17.22,170.512-49.648l3.637-2.917l60.331-60.352c24.927-24.895,24.927-65.568-0.003-90.498C464.612,240.981,423.94,240.981,399.032,265.921z M85.333,469.336H42.667v-256h42.667V469.336z M459.382,326.232l-58.654,58.674c-43.686,27.281-94.146,41.754-145.663,41.754H128.004V271.375l14.593,4.86c2.173,0.724,4.449,1.093,6.74,1.093h106.667c11.685,0,21.333,9.649,21.333,21.333c0,11.685-9.649,21.333-21.333,21.333c-28.444,0-28.444,42.667,0,42.667h97.771c5.657,0,11.082-2.247,15.082-6.246l60.352-60.331c8.257-8.267,21.899-8.267,30.163-0.003S467.637,317.988,459.382,326.232z"/>
</g></g></g>
</svg>`

const num_to_str_dict = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six'
}


miro.onReady(async () => {
	miro.currentUser.getId().then(user_id =>
		gtag('set', {'user_id': user_id}))
	miro.initialize({
		extensionPoints: {
      toolbar: {
        title: 'Dice',
        toolbarSvgIcon: pasteIcon,
        librarySvgIcon: rollIcon,
        onClick: () => {
          miro.board.ui.openBottomPanel('/static/web-plugin/dice_lib', {width: 100, height: 130});
        }
      },
			getWidgetMenuItems: (widgets) => {
        clientId = miro.getClientId()
				if (widgets.some((widget) => widget.type.toLowerCase() != 'image' && (!(clientId in widget.metadata) || !(isDice in widget.metadata.clientId) || widget.metadata.clientId.isDice == false)) == false){
					return Promise.resolve([{
						tooltip: 'Roll',
						svgIcon: rollIcon,
						onClick: rollDice
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function rollDice() {
  let new_widgets = []
  (await miro.board.selection.get()).forEach((widget) => {
    new_widgets.push({
      id: widget['id'],
      url: widget['url'].substr(0, widget['url'].lastIndexOf('/')) + `/${num_to_str_dict[getRandomInt(1,6)]}_dot.svg`
    })
  })
  miro.board.widgets.update(new_widgets)
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