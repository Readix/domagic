gah.wait(5, 20 * 60, () => gah.event(pluginData.gaPluginName, 'use_often', '', 500))
miro.onReady(async () => {
  await session.start();
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

var edges = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function rollDice() {
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
