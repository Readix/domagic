function createImage(canvasX, canvasY, url) {
  let appId = miro.getClientId();
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
  imageWidget.metadata[appId] = {
    isDice: true
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
        createImage(canvasX, canvasY, currentImageUrl);
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
