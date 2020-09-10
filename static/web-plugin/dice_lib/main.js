function createEmoji(canvasX, canvasY) {
  let appId = miro.getClientId();
  let emojiWidget = {
    type: 'EMOJI',
    code: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="640" height="640"><defs><path d="M551.45 76.61C558.04 76.61 563.39 81.96 563.39 88.55C563.39 183.52 563.39 456.48 563.39 551.45C563.39 558.04 558.04 563.39 551.45 563.39C456.48 563.39 183.52 563.39 88.55 563.39C81.96 563.39 76.61 558.04 76.61 551.45C76.61 456.48 76.61 183.52 76.61 88.55C76.61 81.96 81.96 76.61 88.55 76.61C183.52 76.61 456.48 76.61 551.45 76.61Z" id="g6H4LGxhB"></path><mask id="maska3pgC8soar" x="-27.39" y="-27.39" width="694.78" height="694.78" maskUnits="userSpaceOnUse"><rect x="-27.39" y="-27.39" width="694.78" height="694.78" fill="white"></rect><use xlink:href="#g6H4LGxhB" opacity="1" fill="black"></use></mask><path d="M385.51 308.29C385.51 345.05 355.66 374.9 318.9 374.9C282.14 374.9 252.29 345.05 252.29 308.29C252.29 271.53 282.14 241.68 318.9 241.68C355.66 241.68 385.51 271.53 385.51 308.29Z" id="aDHxKg5Fz"></path></defs><g><g><g><g mask="url(#maska3pgC8soar)"><use xlink:href="#g6H4LGxhB" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="104" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#aDHxKg5Fz" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="52" stroke-opacity="1"></use></g></g></g></g></svg>',
    x: canvasX,
    y: canvasY,
    capabilities: {
      editable: false
    },
    metadata: {}
  };
  emojiWidget.metadata[appId] = {
    isDice: true
  };
  return miro.board.widgets.create(emojiWidget);
};

$(document).ready(() => {
  miro.onReady(async () => {
    miro.currentUser.getId().then(user_id => gtag('set', {'user_id': user_id}));
    const imageOptions = {
      draggableItemSelector: 'img',
      onClick: async () => {
        const widget = (await createEmoji(0, 0))[0];
        miro.board.viewport.zoomToObject(widget);
      },
      getDraggableItemPreview: (targetElement) => { //drag-started
        return {
          width: 100,
          height: 100,
          url: location.origin + targetElement.getAttribute('src')
        };
      },
      onDrop: (canvasX, canvasY) => {
        createEmoji(canvasX, canvasY);
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
