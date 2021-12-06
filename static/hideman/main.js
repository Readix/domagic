let shapeSizeToFontSizeRatio = 1 / 3;

pluginData.initRedirectUri()

gah.wait(5, 20 * 60, () => gah.event(pluginData.gaPluginName, 'use_often', '', 500))
miro.onReady(async () => {
    await session.start();
        miro.currentUser.getId().then(user_id => gah.setUser(user_id));
    gah.event(pluginData.gaPluginName, 'available', 'true', 10)
    let allowedWidgetTypes = ['shape', 'sticker'];

    let widgetTypeIsCorrect = (widgetType) => allowedWidgetTypes.indexOf(widgetType) > -1;
    let widgetSquare = (widget) => widget.bounds.width * widget.bounds.height;

	miro.initialize({
		extensionPoints: {
			getWidgetMenuItems: async (widgets) => {
                let standaloneWidgets = widgets.filter((widget) => !('groupId' in widget) || !widget.groupId);
                let groupedWidgets = widgets
                .filter((widget) => !standaloneWidgets.includes(widget))
                .reduce((groups, widget) => {
                        if (widget.groupId in groups)
                            groups[widget.groupId].push(widget);
                        else
                            groups[widget.groupId] = [widget];
                        return groups;
                    }, 
                    {}
                );

                widgetsToProcess = standaloneWidgets.filter((widget) => widgetTypeIsCorrect(widget.type.toLowerCase()));

                for (let groupId in groupedWidgets){
                    let groupWidgets = groupedWidgets[groupId];
                    let maxSquareWidget = groupWidgets.reduce((prev, curr) => widgetSquare(prev) < widgetSquare(curr) ? curr : prev);

                    if (!widgetTypeIsCorrect(maxSquareWidget.type.toLowerCase()))
                        continue;

                    let maxLeftWidget = groupWidgets.reduce((prev, curr) => curr.bounds.left < prev.bounds.left ? curr : prev);
                    if (maxLeftWidget.id != maxSquareWidget.id && maxLeftWidget.bounds.left < maxSquareWidget.bounds.left)
                        continue;
                    let maxRightWidget = groupWidgets.reduce((prev, curr) => curr.bounds.right > prev.bounds.right ? curr : prev);
                    if (maxRightWidget.id != maxSquareWidget.id && maxRightWidget.bounds.right > maxSquareWidget.bounds.right)
                        continue;
                    let maxTopWidget = groupWidgets.reduce((prev, curr) => curr.bounds.top < prev.bounds.top ? curr : prev);
                    if (maxTopWidget.id != maxSquareWidget.id && maxTopWidget.bounds.top < maxSquareWidget.bounds.top)
                        continue;
                    let maxBottomWidget = groupWidgets.reduce((prev, curr) => curr.bounds.bottom > prev.bounds.bottom ? curr : prev);
                    if (maxBottomWidget.id != maxSquareWidget.id && maxBottomWidget.bounds.bottom > maxSquareWidget.bounds.bottom)
                        continue;
                    
                    widgetsToProcess.push(maxSquareWidget);
                }
                
                if (widgetsToProcess.length) {
                    return Promise.resolve([{
                        tooltip: pluginData.tooltip,
                        svgIcon: pluginData.svgIcon,
                        onClick: async () => await flipWidgets(widgetsToProcess.map(widget => widget.id)) // TODO: Передать только id
                    }]);
                }
                
                return Promise.resolve([]);
			}
		}
	});
})

async function flipWidgets(widgetsIds){
    try {
        const isAuthorized = await miro.isAuthorized()

        if (!isAuthorized) {
            miro.requestAuthorization({
                redirect_uri: pluginData.redirect_uri
            })
            return
        }

        let widgets = await miro.board.selection.get();
        widgets = widgets.filter(widget => widgetsIds.indexOf(widget.id) > -1 )

        gah.pin()
        gah.event(pluginData.gaPluginName, 'use', widgets.length, 50)
        
        let clientId = await miro.getClientId();
        let sendBackward = [];
        let bringForward = [];
        let accessErrorWidgets = [];

        let updatedWidgets = await Promise.all(widgets.map( async (widget) => {
            for (key in widget.metadata){
                if (key == clientId)
                    continue;
                delete widget.metadata[key];
            }
            if (clientId in widget.metadata && widget.metadata[clientId]){
                if (widget.metadata[clientId].hidden_by != window.user_id)
                    accessErrorWidgets.push(widget);
                else{ 
                    widget.style = widget.metadata[clientId].style;
                    widget.text = widget.metadata[clientId].text;
                    widget.metadata[clientId] = null;
                    if ('groupId' in widget)
                    sendBackward.push(widget.id);
                }
            } else {
                widget.metadata[clientId] = {
                    style: Object.assign({}, widget.style),
                    text: widget.text == "" ? " " : widget.text,
                    hidden_by: window.user_id
                }
                if (widget.type.toLowerCase() === 'shape'){
                    widget.style.backgroundColor = '#6AC3FD';
                    widget.style.backgroundOpacity = 1;
                    widget.style.borderColor = '#1D2B43';
                    widget.style.borderOpacity = 1;
                    widget.style.borderStyle = 2;
                    widget.style.borderWidth = 1;
                    widget.style.textAlign = 'c';
                    widget.style.textAlignVertical = 'm';
                    widget.style.highlighting = '';
                    widget.style.underline = 0;
                    widget.style.italic = 0;
                    widget.style.bold = 0;
                    widget.style.strike = 0;
                    widget.style.fontSize = Math.min(widget.bounds.width, widget.bounds.height) * shapeSizeToFontSizeRatio;
                    widget.text = '<p>🙈</p>';
                } else {  //otherwise this should be sticker
                    widget.style.stickerBackgroundColor = '#6AC3FD';
                    widget.style.textAlign = 'c';
                    widget.style.textAlignVertical = 'm';
                    widget.style.fontSize = 64;
                    widget.text = '<p>🙈</p>';
                }
                if ('groupId' in widget)
                    bringForward.push(widget.id);
            }
            return widget;
        }));

        console.log(updatedWidgets)

        if (updatedWidgets.length > 0)
            await miro.board.widgets.update(updatedWidgets);
        if (sendBackward.length > 0)
            await miro.board.widgets.sendBackward(sendBackward);
        if (bringForward.length > 0)
            await miro.board.widgets.bringForward(bringForward);
        
        if (accessErrorWidgets.length > 0){
            miro.showErrorNotification("Some widgets can`t be flipped because they was being hidden by another user");
            await miro.board.widgets.__blinkWidget(accessErrorWidgets);
        }
    } catch (error) {
        if (typeof(error) === 'string' && error.indexOf('requires scope') > -1) {
            miro.requestAuthorization({
                redirect_uri: pluginData.redirect_uri
            })
        }
        else {
            console.log(error)
            miro.showErrorNotification('Unexpected error. Please, <a target="_blank" href="http://domagick.korpus.io/#block-3" >contact us.</a>')
        }
    }
}
