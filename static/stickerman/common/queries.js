var session = {}
session.start = async () => {
	return $.ajax({
		url: '/user/startSession',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: JSON.stringify({
			access_token: auth.token
		})
    });
}
session.end = async () => {
	return $.ajax({
		url: '/user/endSession',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: JSON.stringify({
			access_token: auth.token
		})
	})
}
window.addEventListener("beforeunload", async function (e) {
    await session.end();
});