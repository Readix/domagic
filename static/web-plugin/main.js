let icon = "<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" fill-rule=\"evenodd\" stroke=\"currentColor\" stroke-width=\"2\"></circle>";
let prevFrame = {
  'id': '',
  'widgetsId': []
};
let countCallWithSameFrame = 0;
var config = {};
$.get('config.json', json => {config = json}).fail(() => {console.log('Error: couldn\'t load config')})


miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      getWidgetMenuItems: (widgets) => {
        if (widgets.length != 1 || widgets[0].type.toLowerCase() != 'frame') {
          return Promise.resolve([{}])
        }
        return Promise.resolve([{
          tooltip: 'Optimize layout dev',
          svgIcon: icon,
          onClick: () => run(widgets[0].id)
        }])
      }
    }
  })
})


var run = async (frameId) => {
  let team_id = (await miro.account.get())['id']
  let user_id = await miro.currentUser.getId()
  let frame = await miro.board.widgets.get({id: frameId})
  let data = {
    'user': user_id,
    'team': team_id,
    'board': {
      'width': frame[0].bounds.width,
      'height': frame[0].bounds.height
    },
    'elems': []
  };

  let isPrevFrame = false;
  if(prevFrame['id'] == frame[0]['id'] && prevFrame['widgetsId'].length == frame[0]['childrenIds'].length){
    let i;
    for(i = 0; i < frame[0]['childrenIds'].length && frame[0]['childrenIds'][i] == prevFrame['widgetsId'][i]; i++);
    if(i == frame[0]['childrenIds'].length)
      isPrevFrame = true;
  }
  if(isPrevFrame == false){
    prevFrame['id'] = frame[0]['id'];
    prevFrame['widgetsId'] = frame[0]['childrenIds'];
    countCallWithSameFrame = 0;
  }else
    countCallWithSameFrame++;
  data['isPrevFrame'] = isPrevFrame;
  data['countCallWithSameFrame'] = countCallWithSameFrame;

  let sourceObjects = [];
  let groups = {};
  for(let i=0; i < frame[0].childrenIds.length; i++){
    item = await miro.board.widgets.get({'id': frame[0].childrenIds[i]});
    sourceObjects.push(item[0]);
    data.elems.push({
      'x': item[0].bounds.left - frame[0].bounds.left,
      'y': item[0].bounds.top - frame[0].bounds.top,
      'type': item[0].type,
      'height': item[0].bounds.height,
      'width': item[0].bounds.width,
      'id': item[0].id
    });
  }

  $.ajax({
    url: config.host + '/generate',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    data: data,
    success: res => {
      switch (parseInt(res.code / 100)) {
        case 1:
          miro.showNotification(res.message)
          break
        case 2:
          miro.showErrorNotification(res.message)
          return
        case 3:
          miro.showErrorNotification('server error')
          return
      }

      objectsToUpdate = []
      res.widgets.forEach(element => {
        object = sourceObjects.find(object => object.id == element.id);
        object.x = element.area.leftTop.x + frame[0].bounds.left + element.width/2;
        object.y = element.area.leftTop.y + frame[0].bounds.top + element.height/2;
        objectsToUpdate.push(object)
      });
      miro.board.widgets.update(objectsToUpdate);
    }
  });
}
