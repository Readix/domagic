let textArray = ["table", "chair", "sofa", "drawer"];	
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
  gah.event(pluginData.gaPluginName, 'available', 'true', 10)
	miro.initialize({
		extensionPoints: {
			toolbar: {
        title: pluginData.title,
        toolbarSvgIcon: pluginData.toolbarSvgIcon,
        librarySvgIcon: pluginData.librarySvgIcon,
        onClick: () => {
          miro.board.ui.openBottomPanel('/static/wordman/dice_lib', {width: 100, height: 130});
        }
      },
			getWidgetMenuItems: (widgets) => {
        clientId = miro.getClientId()
				if (widgets.every((widget) => widget.type.toLowerCase() == 'shape' && widget.metadata[clientId] && widget.metadata[clientId].isDice)){
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
  })
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function rollDice() {
  let isAuth = await auth.checkAuth(true);
  if (!isAuth) return;

  (await miro.board.selection.get()).forEach((widget) => {
    miro.board.widgets.update({
      id: widget['id'],
      text: textArray[getRandomInt(0,5)]
    });
  });
  gah.pin()
  gah.event(pluginData.gaPluginName, 'use', 50)
};

