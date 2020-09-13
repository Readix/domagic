var fs = require('fs');
var config = require('./config.json');
var { app, send } = require('./app-base');
var db = require('./db');

let port_arg = process.argv.slice(-1)[0]
if (!port_arg) port_arg = 3000
else {
	if (port_arg.split('=')[0] != 'port') {
		console.error('Unknown argument')
		process.exit()
	}
	port_arg = port_arg.split('=')[1]
}
const port = port_arg

if (!config.plugins.length)
    throw new Error('Empty plugins list')

config.plugins
	.filter(name => 
		fs.readdirSync('./src/plugins/').indexOf(name + '.js') > -1)
	.forEach(name => require('./plugins/' + name))

app.listen(port, () => {
	db.init()
	console.log(`App listening on port ${port}`)
})