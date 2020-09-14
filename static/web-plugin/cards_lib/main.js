function createCard(canvasX, canvasY, url) {
  key = url.substring(url.lastIndexOf('/') + 1);
  let shapes = [];
  switch(key){
    case 'template_picture_text_card.png':
      shapes = [{
          type: "SHAPE",
          x: canvasX,
          y: canvasY,
          width: 363.065216637282,
          height: 363.06521663727926,
          style: {
            shapeType: 3,
            backgroundColor: "#e6e6e6",
            backgroundOpacity: 1,
            borderColor: "#0e1beb",
            borderWidth: 1,
            borderOpacity: 1,
            borderStyle: 1,
            fontFamily: 10,
            textColor: "#1a1a1a",
            textAlign: "c",
            textAlignVertical: "m",
            fontSize: 26,
            bold: 0,
            italic: 0,
            underline: 0,
            strike: 0,
            highlighting: ""
          },
        },
        {
          type: "IMAGE",
          x: canvasX, 
          y: canvasY - 30.86183472481389, 
          scale: 1.3176765802095134,
          url: location.origin + '/static/web-plugin/cards_lib/previews/picture_template.png'
        },
        {
          type:"TEXT",
          style: {
            backgroundColor: "transparent",
            backgroundOpacity: 1,
            textAlign: "c",
            textColor: "#414bb2",
            fontFamily: 25,
            bold: 0,
            underline: 0,
            italic: 0,
            strike: 0,
            borderColor: "transparent",
            borderOpacity: 1,
            borderWidth: 2,
            borderStyle: 2,
            highlighting: ""
          },
          x: canvasX + 0.5212930894704186,
          y: canvasY + 132.80208364611553,
          width: 151.81895893321675,
          scale: 1.9285714285714286,
          rotation: 0,
          text: "<p>Place your text here</p>"
        },
        {
          type: "LINE",
          style: {
            lineColor: "#414bb2",
            lineStyle: 1,
            lineThickness: 1,
            lineType: 0,
            lineStartStyle: 0,
            lineEndStyle: 0
          },
          startPosition: {
            x: canvasX - 181.53260831863736,
            y: canvasY - 100.9058232961379
          },
          endPosition: {
            x: canvasX + 181.53260831864463,
            y: canvasY - 100.9058232961379
          }
        }
      ]
      break
    default:
      miro.showNotification('Plugin error, please, try again later')
  }
  miro.board.widgets.create(shapes)
};

function createImage(canvasX, canvasY, url){
  let imageWidget = {
    type: 'image',
    url: url,
    x: canvasX,
    y: canvasY,
    capabilities: {
      editable: false
    },
    metadata: {}
  };
  return miro.board.widgets.create(imageWidget);
};


$(document).ready(() => {
  miro.onReady(async () => {
    miro.currentUser.getId().then(user_id => gtag('set', {'user_id': user_id}));
    let currentImageUrl;
    const imageOptions = {
      draggableItemSelector: 'img',
      onClick: async (targetElement) => {
        currentImageUrl = location.origin + targetElement.getAttribute('src');
        const widget = (await createImage(0, 0, currentImageUrl))[0];
        miro.board.viewport.zoomToObject(widget);
      },
      getDraggableItemPreview: (targetElement) => { //drag-started
        currentImageUrl = location.origin + targetElement.getAttribute('src');
        return {
          width: 100,
          height: 100,
          url: currentImageUrl
        };
      },
      onDrop: (canvasX, canvasY) => {
        createCard(canvasX, canvasY, currentImageUrl);
      }
    }
    miro.board.ui.initDraggableItemsContainer(document.getElementById("root"), imageOptions);
    miro.addListener('CANVAS_CLICKED', () => miro.board.ui.closeBottomPanel());
    Object.defineProperty(window, 'team_id', {
        value: (await miro.account.get())['id'],
        configurable: false,
        writable: false
    })
    Object.defineProperty(window, 'user_id', {
        value: await miro.currentUser.getId(),
        configurable: false,
        writable: false
    })
  })
})