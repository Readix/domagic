let icon = "<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" fill-rule=\"evenodd\" stroke=\"currentColor\" stroke-width=\"2\"></circle>";


rtb.onReady(() => {

  rtb.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Hi',
        svgIcon: icon,
        onClick: async () => {
          alert('pressed');
          // Get all board objects
          let objects = await miro.board.selection.get();
          console.log(objects);

          let json_file = {
            'board': 1,
            'elems': []
          };
          let leftTop = { x: 0, y: 0 };
          function returnJson(obj, json) {
            let xmin = obj[0].x, ymin = obj[0].y,
                xmax = 0, ymax = 0;
            obj.forEach((item) => {
              xmin = Math.min(item.x, xmin);
              ymin = Math.min(item.y, ymin);
              xmax = Math.max(item.x, xmax);
              ymax = Math.max(item.y, ymax);
              const h = item.bounds.height;
              const w = item.bounds.width;
              const type = item.type;
              let elem = {
                type: type,
                height: h,
                width: w,
                id: item.id
              };
              json.elems.push(elem);
            });
            leftTop.x = xmin;
            leftTop.y = ymin;
            return json;
          };

          json_file.board = { width: 1000000, height: 500000 };
          let answer = returnJson(objects, json_file);

          $.ajax({
            url: 'https://9c8c5fb0.ngrok.io/test1',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            data: answer,
            success: res => {
              console.log('res:', res);
              
              res.forEach(element => {
                for (let i = 0; i < objects.length; i++) {
                  if (objects[i].id != element.id){
                    continue;
                  }
                  objects[i].x = element.leftTop.x + leftTop.x;
                  objects[i].y = element.leftTop.y + leftTop.y;
                  break;
                }
              });
              rtb.board.widgets.update(objects);
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
