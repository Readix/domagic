gah.wait(5, 20 * 60, () => gah.event(pluginData.gaPluginName, 'use_often', '', 500))
miro.onReady(async () => {
	await session.start();
	miro.currentUser.getId().then(user_id => gah.setUser(user_id))
  	gah.event(pluginData.gaPluginName, 'available', 'true', 10)
	miro.initialize({
		extensionPoints: {
			getWidgetMenuItems: async (widgets) => {
				if (widgets.length > 1 && widgets.some((widget) => widget.type.toLowerCase() != 'sticker' && widget.type.toLowerCase() != 'shape') == false){
					return Promise.resolve([{
						tooltip: pluginData.tooltip,
						svgIcon: pluginData.svgIcon,
						onClick: async () => {
							gah.pin()
							miro.board.ui.openModal('/static/stickerman/sticker-comparator-form', {'width':200, 'height':306})
            			}
          			}])
				}
				return Promise.resolve([])
			}
		}
	})
})
