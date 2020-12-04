gah.wait(5, 20 * 60, () => gah.event(pluginData.gaPluginName, 'use_often', '', 500))
miro.onReady(async () => {
  await auth.initToken();
  if (!auth.token) {
    console.log(pluginData.gaPluginName + ': no token');
    return;
  }
  await session.start();
  await auth.initAuth();
	miro.currentUser.getId().then(user_id => gah.setUser(user_id));
  gah.event(pluginData.gaPluginName, 'available', 'true', 10);
  miro.initialize({
		extensionPoints: {
			toolbar: {
        title: pluginData.title,
        toolbarSvgIcon: pluginData.toolbarSvgIcon,
        librarySvgIcon: pluginData.librarySvgIcon,
        onClick: () => {
          miro.board.ui.openBottomPanel('/static/diceman/dice_lib', {width: 100, height: 130});
        }
      },
			getWidgetMenuItems: (widgets) => {
        clientId = miro.getClientId()
				if (widgets.every((widget) => widget.type.toLowerCase() == 'emoji' && widget.metadata[clientId] && widget.metadata[clientId].isDice)){
					return Promise.resolve([{
						tooltip: pluginData.tooltip,
						svgIcon: pluginData.svgIcon,
						onClick: rollDice
          }])
				}
				return Promise.resolve([]);
			}
		}
  });

  miro.addListener('WIDGETS_TRANSFORMATION_UPDATED', result => {
    let clientId = miro.getClientId()
    let count = result.data.filter(widget => {
      return widget.metadata[clientId] && widget.metadata[clientId].isDice
    }).length
    gah.event(pluginData.gaPluginName, 'touch', count, 50)
  });
});

var diceSize = {width: 1980, height: 1980};
var edges = [
  `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="${diceSize.width}" height="${diceSize.height}"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="g6H4LGxhB"></path><mask id="maska3pgC8soar" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#g6H4LGxhB" opacity="1" fill="black"></use></mask><path d="M385.51 308.29C385.51 345.05 355.66 374.9 318.9 374.9C282.14 374.9 252.29 345.05 252.29 308.29C252.29 271.53 282.14 241.68 318.9 241.68C355.66 241.68 385.51 271.53 385.51 308.29Z" id="aDHxKg5Fz"></path></defs><g><g><g><g mask="url(#maska3pgC8soar)"><use xlink:href="#g6H4LGxhB" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#aDHxKg5Fz" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="52" stroke-opacity="1"></use></g></g></g></g></svg>`,
  `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="${diceSize.width}" height="${diceSize.height}"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="aS43vyYgs"></path><mask id="maskd1wJMdMhmg" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#aS43vyYgs" opacity="1" fill="black"></use></mask><path d="M225.82 481C225.82 510.49 201.88 534.43 172.39 534.43C142.9 534.43 118.96 510.49 118.96 481C118.96 451.51 142.9 427.57 172.39 427.57C201.88 427.57 225.82 451.51 225.82 481Z" id="a4Nyg19AlT"></path><path d="M516.44 160.23C516.44 189.72 492.5 213.66 463.01 213.66C433.52 213.66 409.58 189.72 409.58 160.23C409.58 130.74 433.52 106.8 463.01 106.8C492.5 106.8 516.44 130.74 516.44 160.23Z" id="b1oXYbafFQ"></path></defs><g><g><g><g mask="url(#maskd1wJMdMhmg)"><use xlink:href="#aS43vyYgs" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#a4Nyg19AlT" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b1oXYbafFQ" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g></g></g></svg>`,
  `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="${diceSize.width}" height="${diceSize.height}"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="aS43vyYgs"></path><mask id="maskd1wJMdMhmg" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#aS43vyYgs" opacity="1" fill="black"></use></mask><path d="M225.82 481C225.82 510.49 201.88 534.43 172.39 534.43C142.9 534.43 118.96 510.49 118.96 481C118.96 451.51 142.9 427.57 172.39 427.57C201.88 427.57 225.82 451.51 225.82 481Z" id="a4Nyg19AlT"></path><path d="M516.44 160.23C516.44 189.72 492.5 213.66 463.01 213.66C433.52 213.66 409.58 189.72 409.58 160.23C409.58 130.74 433.52 106.8 463.01 106.8C492.5 106.8 516.44 130.74 516.44 160.23Z" id="b1oXYbafFQ"></path><path d="M373.43 320C373.43 349.49 349.49 373.43 320 373.43C290.51 373.43 266.57 349.49 266.57 320C266.57 290.51 290.51 266.57 320 266.57C349.49 266.57 373.43 290.51 373.43 320Z" id="cwzA75oP9"></path></defs><g><g><g><g mask="url(#maskd1wJMdMhmg)"><use xlink:href="#aS43vyYgs" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#a4Nyg19AlT" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b1oXYbafFQ" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#cwzA75oP9" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g></g></g></svg>`,
  `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="${diceSize.width}" height="${diceSize.height}"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="aS43vyYgs"></path><mask id="maskd1wJMdMhmg" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#aS43vyYgs" opacity="1" fill="black"></use></mask><path d="M225.82 160.23C225.82 189.72 201.88 213.66 172.39 213.66C142.9 213.66 118.96 189.72 118.96 160.23C118.96 130.74 142.9 106.8 172.39 106.8C201.88 106.8 225.82 130.74 225.82 160.23Z" id="bjtFzNaEU"></path><path d="M225.82 481C225.82 510.49 201.88 534.43 172.39 534.43C142.9 534.43 118.96 510.49 118.96 481C118.96 451.51 142.9 427.57 172.39 427.57C201.88 427.57 225.82 451.51 225.82 481Z" id="a4Nyg19AlT"></path><path d="M516.44 160.23C516.44 189.72 492.5 213.66 463.01 213.66C433.52 213.66 409.58 189.72 409.58 160.23C409.58 130.74 433.52 106.8 463.01 106.8C492.5 106.8 516.44 130.74 516.44 160.23Z" id="b1oXYbafFQ"></path><path d="M516.44 481C516.44 510.49 492.5 534.43 463.01 534.43C433.52 534.43 409.58 510.49 409.58 481C409.58 451.51 433.52 427.57 463.01 427.57C492.5 427.57 516.44 451.51 516.44 481Z" id="cwSIaHto2"></path></defs><g><g><g><g mask="url(#maskd1wJMdMhmg)"><use xlink:href="#aS43vyYgs" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#bjtFzNaEU" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#a4Nyg19AlT" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b1oXYbafFQ" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#cwSIaHto2" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g></g></g></svg>`,
  `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="${diceSize.width}" height="${diceSize.height}"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="aS43vyYgs"></path><mask id="maskd1wJMdMhmg" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#aS43vyYgs" opacity="1" fill="black"></use></mask><path d="M225.82 160.23C225.82 189.72 201.88 213.66 172.39 213.66C142.9 213.66 118.96 189.72 118.96 160.23C118.96 130.74 142.9 106.8 172.39 106.8C201.88 106.8 225.82 130.74 225.82 160.23Z" id="bjtFzNaEU"></path><path d="M225.82 481C225.82 510.49 201.88 534.43 172.39 534.43C142.9 534.43 118.96 510.49 118.96 481C118.96 451.51 142.9 427.57 172.39 427.57C201.88 427.57 225.82 451.51 225.82 481Z" id="a4Nyg19AlT"></path><path d="M516.44 160.23C516.44 189.72 492.5 213.66 463.01 213.66C433.52 213.66 409.58 189.72 409.58 160.23C409.58 130.74 433.52 106.8 463.01 106.8C492.5 106.8 516.44 130.74 516.44 160.23Z" id="b1oXYbafFQ"></path><path d="M373.43 320C373.43 349.49 349.49 373.43 320 373.43C290.51 373.43 266.57 349.49 266.57 320C266.57 290.51 290.51 266.57 320 266.57C349.49 266.57 373.43 290.51 373.43 320Z" id="b9h0LNu4i"></path><path d="M516.44 481C516.44 510.49 492.5 534.43 463.01 534.43C433.52 534.43 409.58 510.49 409.58 481C409.58 451.51 433.52 427.57 463.01 427.57C492.5 427.57 516.44 451.51 516.44 481Z" id="cwSIaHto2"></path></defs><g><g><g><g mask="url(#maskd1wJMdMhmg)"><use xlink:href="#aS43vyYgs" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#bjtFzNaEU" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#a4Nyg19AlT" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b1oXYbafFQ" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b9h0LNu4i" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#cwSIaHto2" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g></g></g></svg>`,
  `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="${diceSize.width}" height="${diceSize.height}"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="aS43vyYgs"></path><mask id="maskd1wJMdMhmg" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#aS43vyYgs" opacity="1" fill="black"></use></mask><path d="M225.82 160.23C225.82 189.72 201.88 213.66 172.39 213.66C142.9 213.66 118.96 189.72 118.96 160.23C118.96 130.74 142.9 106.8 172.39 106.8C201.88 106.8 225.82 130.74 225.82 160.23Z" id="bjtFzNaEU"></path><path d="M225.82 320C225.82 349.49 201.88 373.43 172.39 373.43C142.9 373.43 118.96 349.49 118.96 320C118.96 290.51 142.9 266.57 172.39 266.57C201.88 266.57 225.82 290.51 225.82 320Z" id="b7yRXkbGP"></path><path d="M225.82 481C225.82 510.49 201.88 534.43 172.39 534.43C142.9 534.43 118.96 510.49 118.96 481C118.96 451.51 142.9 427.57 172.39 427.57C201.88 427.57 225.82 451.51 225.82 481Z" id="a4Nyg19AlT"></path><path d="M516.44 160.23C516.44 189.72 492.5 213.66 463.01 213.66C433.52 213.66 409.58 189.72 409.58 160.23C409.58 130.74 433.52 106.8 463.01 106.8C492.5 106.8 516.44 130.74 516.44 160.23Z" id="b1oXYbafFQ"></path><path d="M516.44 320C516.44 349.49 492.5 373.43 463.01 373.43C433.52 373.43 409.58 349.49 409.58 320C409.58 290.51 433.52 266.57 463.01 266.57C492.5 266.57 516.44 290.51 516.44 320Z" id="b361ksO6iL"></path><path d="M516.44 481C516.44 510.49 492.5 534.43 463.01 534.43C433.52 534.43 409.58 510.49 409.58 481C409.58 451.51 433.52 427.57 463.01 427.57C492.5 427.57 516.44 451.51 516.44 481Z" id="cwSIaHto2"></path></defs><g><g><g><g mask="url(#maskd1wJMdMhmg)"><use xlink:href="#aS43vyYgs" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#bjtFzNaEU" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b7yRXkbGP" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#a4Nyg19AlT" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b1oXYbafFQ" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#b361ksO6iL" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#cwSIaHto2" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="44" stroke-opacity="1"></use></g></g></g></g></svg>`
];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function rollDice() {
  let isAuth = await auth.checkAuth(true);
  if (!isAuth) return;

  let new_widgets = [];
  let gahSizes = [];
  (await miro.board.selection.get()).forEach((widget) => {
    new_widgets.push({
      id: widget['id'],
      code: edges[getRandomInt(0,5)]
    });
    gahSizes.push(widget.bounds.width);
  });
  let meanSize = gahSizes.reduce((sum, cur) => sum + cur, 0) / gahSizes.length;
  gah.pin();
  gah.event(pluginData.gaPluginName, 'use', meanSize, 50);
  miro.board.widgets.update(new_widgets);
};
