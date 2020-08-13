let icon = `<g id="slidermanico-layer">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.8535 7.67685L11.396 9.39758L21.1468 23.3232L23.6043 21.6024L13.8535 7.67685ZM13.6079 9.06958L12.7887 9.64316L14.5095 12.1006L15.3286 11.527L13.6079 9.06958Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 1H23V8H16.5211L14.3444 4.8914L14 5.13256V1ZM18 3H19V4H18V3ZM20 4H19V5H18V6H19V5H20V6H21V5H20V4ZM20 4V3H21V4H20Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 1H11V7.23318L8.61035 8.90643L10.7765 12H1V1ZM4 5H5V6H4V5ZM6 6H5V7H4V8H5V7H6V8H7V7H6V6ZM6 6V5H7V6H6Z" fill="#37335F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.8771 15H1V23H16V19.4599L12.8771 15ZM8 18H9V19H8V18ZM10 19H9V20H8V21H9V20H10V21H11V20H10V19ZM10 19V18H11V19H10Z" fill="#37335F"/>
</g>`
let prevFrame = {
    'id': '',
    'widgetsId': []
};
let countCallWithSameFrame = 0;

miro.onReady(async () => {
	miro.currentUser.getId().then(user_id =>
		gtag('set', {'user_id': user_id}))
	miro.initialize({
		extensionPoints: {
			getWidgetMenuItems: (widgets) => {
				if (widgets.length == 1 && widgets[0].type.toLowerCase() == 'frame') {
					return Promise.resolve([{
						tooltip: 'Make slide better',
						svgIcon: icon,
						onClick: () => proccessSlide(widgets[0].id)
					}])
				}
				if (widgets.length > 1 && widgets.some((widget) => widget.type.toLowerCase() != 'sticker' && widget.type.toLowerCase() != 'shape') == false){
					return Promise.resolve([{
						tooltip: 'Compare stickers',
						svgIcon: icon,
						onClick: () => miro.board.ui.openModal('/static/web-plugin/sticker-comparator-form', {'width':220, 'height':360})
                    }])
				}
				return Promise.resolve([{}])
			}
		}
	})
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
  	$.ajax({
        url: '/startSession',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            user_id: user_id,
            team_id: team_id
        }
  	})
})

window.addEventListener("beforeunload", async function (e) {
  await $.ajax({
    url: '/endSession',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
      user_id: user_id,
      team_id: team_id
    }
  })
});

var proccessSlide = async (frameId) => {
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
	}
	else countCallWithSameFrame++;
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
	gtag('event', 'Кол-во элементов', {
		'event_category': 'Генерация',
		'event_label': `${data.elems.length}`,
		'value': 10
	});

	$.ajax({
	url: '/generate',
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	},
	data: data,
	success: res => {
		gtag('event', 'Код ошибки', {
			'event_category': 'Генерация',
			'event_label': `${res.code}`,
			'value': 10
		});
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