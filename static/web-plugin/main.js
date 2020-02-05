let icon = "<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" fill-rule=\"evenodd\" stroke=\"currentColor\" stroke-width=\"2\"></circle>";
let prevFrame = {
  'id': '',
  'widgetsId': []
};
let countCallWithSameFrame = 0;

rtb.onReady(() => {

  rtb.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Hi-KorpusServer',
        svgIcon: icon,
        onClick: async () => {
          // alert('pressed');
          // Get all board objects
          let frame = await miro.board.selection.get();
          if(frame.length > 1 || frame[0].type != 'FRAME'){
            alert('Please choose only one frame!');
            return;
          }
          console.log('frame: ', frame);
          let data = {
            'board': {
              'width': frame[0].bounds.width, 
              'height': frame[0].bounds.height
            },
            'elems': []
          };
          
          console.log(prevFrame);
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
            console.log('pushed elem: ', item);
            sourceObjects.push(item[0]);
            // if(item[0]['groupId'] != undefined){
            //   if(groups[item[0]['groupId']] != undefined){
            //     groups[item[0]['groupId']].push(item[0]);
            //   }else{
            //     groups[item[0]['groupId']] = [item[0]];
            //   }
            // }else{
            //   groups[item[0]['id']] = [item[0]];
            // }
            data.elems.push({
              'x': item[0].bounds.left - frame[0].bounds.left,
              'y': item[0].bounds.top - frame[0].bounds.top,
              'type': item[0].type,
              'height': item[0].bounds.height,
              'width': item[0].bounds.width,
              'id': item[0].id
            });
          }
          // groups.forEach( groupId => {
          //   let group = groups[groupId];
          //   let xmax = Number.MAX_VALUE;
          //   let xmin = 0;
          //   let ymax = Number.MAX_VALUE;
          //   let ymin = 0;
          //   let imagesCount = 0;
          //   let textCount = 0;
          //   for(let widget in group){
          //     xmax = Math.max(xmax, widget.borders.right);
          //     xmin = Math.min(xmin, widget.borders.left);
          //     ymax = Math.max(ymax, widget.borders.bottom);
          //     ymin = Math.min(ymin, widget.borders.top);
          //     switch(widget.type){
          //       case 'STICKER':
          //       case 'TEXT': textCount++; break;
          //       case 'IMAGE':
          //       case 'MOCKUP':
          //       case 'SHAPE':
          //       case 'LINE': imagesCount++; break;
          //     }
          //   }
          //   data.elems.push({
          //     'x': xmin - frame[0].bounds.left,
          //     'y': ymin - frame[0].bounds.top,
          //     'type': imagesCount > textCount ? 'IMAGE' : 'TEXT',
          //     'height': xmax - xmin,
          //     'width': ymax - ymin,
          //     'id': groupId
          //   });
          // });

          console.log('sended info:', data);

          $.ajax({
            url: 'https://e45a38b7.ngrok.io/test1',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            success: res => {
              console.log('res:', res);
              if (res.error) {
                alert('Уменьшите размер объектов');
                return;
              }
              
              res.widgets.forEach(element => {
                object = sourceObjects.find(object => object.id == element.id);
                object.x = element.area.leftTop.x + frame[0].bounds.left + element.width/2;
                object.y = element.area.leftTop.y + frame[0].bounds.top + element.height/2;
              });

              console.log("sourseScore: " + res.sourceScore);
              console.log("score: " + res.score);
              console.log("score > sourceScore = " + (res.score > res.sourceScore));
              rtb.board.widgets.update(sourceObjects);
            }
          });

/*          //Create new sticker
await miro.board.widgets.create({type: 'sticker', text: 'Hello'})
// Get all stickers from board
let allStickers = await miro.board.widgets.get({type: 'sticker'})
console.log(allStickers)

//Locally hide all stickers for current user
const allStickers = await miro.board.widgets.get({type: 'sticker'})
allStickers.forEach(s => {
	s.clientVisible = false
})

miro.board.widgets.update(allStickers)
*/
        }
      }
    }
  })
})

/*
miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Sticker to shapes',
        svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
        positionPriority: 1,
        onClick: async () => {
          /////
          alert('Hi111!')
          let objects = await miro.board.widgets.get()
          console.log("objects = ", objects)

          // Get selected widgets
          let selectedWidgets = await miro.board.selection.get()
          console.log("selectedWidgets = ", selectedWidgets)
          /////

          // Filter stickers from selected widgets
          let stickers = selectedWidgets.filter(widget => widget.type === 'STICKER')

          // Delete selected stickers
          await miro.board.widgets.deleteById(stickers.map(sticker => sticker.id))

          // Create shapes from selected stickers
          await miro.board.widgets.create(stickers.map(sticker => ({
            type: 'shape',
            text: sticker.text,
            x: sticker.x,
            y: sticker.y,
            width: sticker.bounds.width,
            height: sticker.bounds.height,
          })))

          // Show success message
          miro.showNotification('Stickers has been converted')
        }
      }
    }
  })
})*/
