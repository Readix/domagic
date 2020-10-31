let icon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 36 45" style="enable-background:new 0 0 36 36;" xml:space="preserve"><g><path d="M34.3,31.3c-0.8,0.9-1.9,1.6-3.2,1.6H5c-1.5,0-2.8-0.8-3.5-2c-0.6-0.9-0.6-2.1-0.2-3.1l5.4-13c0.7-2.3,2.4-4.2,4.7-4.2   L4.1,28.1c-0.4,1,0,1.7,1.7,1.7h24.5c1.7,0,2.1-0.9,1.7-1.7l-7.9-17.7c0,0,0-0.1,0-0.1v0c-2.7-5.4-4.2-3.4-5,0c0,0,0,0.1,0,0.1   c-0.2,1-0.4,2-0.5,3.1c-0.3,2.9-0.4,5.7-0.4,5.7h3.4c0.5,0,0.4,0.6,0.2,0.9l-4.4,6.3l-1.2,1.7l-0.5,0.8c-0.2,0.2-0.6,0.2-0.8,0   l-0.5-0.8L13,26.4L8.6,20c-0.1-0.1-0.2-0.3-0.2-0.4c0-0.2,0.1-0.4,0.3-0.4h2.8c0.4-2.1,0.8-3.9,1.2-5.5c0.3-1.1,0.6-2.2,0.9-3.1   c0-0.1,0-0.2,0.1-0.2c4.8-14.4,11.4-3.6,14,1.7c0.7,1.3,1.1,2.3,1.1,2.5l0,0l5.9,13C35.3,28.8,35.2,30.2,34.3,31.3z"/></g><text x="0" y="51" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by Nathan Smith</text><text x="0" y="56" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>`;
let tooltipLabel = 'Flip'

let isAuth = async () => {
  return await $.ajax({
    url: '/plugin/hideman/auth',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      access_token: await miro.getToken()
    }
  }).then(res => res, () => {
    return {code: 500, message: 'Server error, please, try again later'};
  })
}

let authResponse = {code: 201, message: 'Something goes wrong, try again later'}

gah.wait(5, 20 * 60, () => gah.event('HideMan', 'use_often', '', 500))
miro.onReady(async () => {
  isAuth().then(res => {authResponse = res})
	miro.currentUser.getId().then(user_id => gah.setUser(user_id));
  gah.event('HideMan', 'available', 'true', 10)
  let allowedWidgetTypes = ['shape', 'sticker'];

  let widgetTypeIsCorrect = (widgetType) => allowedWidgetTypes.indexOf(widgetType) > -1;
  let widgetSquare = (widget) => widget.bounds.width * widget.bounds.height;

	miro.initialize({
		extensionPoints: {
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
        }
        
        if (widgetsToProcess.length)
          return Promise.resolve([{
            tooltip: tooltipLabel,
            svgIcon: icon,
            onClick: async () => await flipWidgets(widgetsToProcess)
          }]);
        else
          return Promise.resolve([]);
			}
		}
	});
  Object.defineProperty(window, 'team_id', {
      value: (await miro.account.get())['id'],
      configurable: false,
      writable: false
  });
  Object.defineProperty(window, 'user_id', {
      value: await miro.currentUser.getId(),
      configurable: false,
      writable: false
  });
  $.ajax({
      url: '/user/startSession',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        access_token: await miro.getToken()
      })
  });
})

async function flipWidgets(widgets){
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

  gah.pin()
  gah.event('HideMan', 'use', widgets.length, 50)
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
        widget.style.fontSize = 0;
        widget.text = '<p>🙈</p>';
      }else{  //otherwise this should be sticker
        widget.style.stickerBackgroundColor = '#6AC3FD';
        widget.style.textAlign = 'c';
        widget.style.textAlignVertical = 'm';
        widget.style.fontSize = 0;
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