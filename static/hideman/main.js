let shapeSizeToFontSizeRatio = 1 / 3;

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
<<<<<<< Updated upstream
  gah.event(pluginData.gaPluginName, 'available', 'true', 10)
=======
  gah.event('HideMan', 'available', 'true', 10)
>>>>>>> Stashed changes
  let allowedWidgetTypes = ['shape', 'sticker'];

  let widgetTypeIsCorrect = (widgetType) => allowedWidgetTypes.indexOf(widgetType) > -1;
  let widgetSquare = (widget) => widget.bounds.width * widget.bounds.height;

	miro.initialize({
		extensionPoints: {
<<<<<<< Updated upstream
			getWidgetMenuItems: async (widgets) => {
        widgets = await miro.board.selection.get();

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
=======
			getWidgetMenuItems: (widgets) => {
        let widgetsToProcess = [];
        let groupedWidgets = {};
        let prevGroupId = undefined;
        let prevGroupChanged = false;

        for (const [i, widget] of widgets.entries()) {
          if ('groupId' in widget && widget.groupId)
            (groupedWidgets[widget.groupId] = groupedWidgets[widget.groupId] || []).push(widget);
          else if (widgetTypeIsCorrect(widget.type.toLowerCase()))
            widgetsToProcess.push(widget.id);

          if (prevGroupId != widget.groupId)
            prevGroupChanged = true;
          
          if ((prevGroupChanged || i == widgets.length - 1) && prevGroupId) {
            let groupWidgets = groupedWidgets[prevGroupId];
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
          prevGroupId = widget.groupId;
>>>>>>> Stashed changes
        }
        
        if (widgetsToProcess.length)
          return Promise.resolve([{
<<<<<<< Updated upstream
            tooltip: pluginData.tooltip,
            svgIcon: pluginData.svgIcon,
            onClick: async () => await flipWidgets(widgetsToProcess)
          }]);
        else
          return Promise.resolve([]);
=======
            tooltip: tooltipLabel,
            svgIcon: icon,
            onClick: async () => await flipWidgets(widgetsToProcess.map(widget => widget.id))
          }]);

				return Promise.resolve([]);
>>>>>>> Stashed changes
			}
		}
	});
})

async function flipWidgets(widgets){
  let isAuth = await auth.checkAuth(true);
  if (!isAuth) return;

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
    }else{
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
      }else{  //otherwise this should be sticker
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
}
