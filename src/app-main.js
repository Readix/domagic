var fs = require('fs');
var config = require('./config.json');
var { app, send } = require('./app-base');
var db = require('./db');

let port_arg = process.argv.slice(-1)[0]
if (port_arg.split('=')[0] != 'port') {
	port_arg = 3000
}
else {
	port_arg = port_arg.split('=')[1]
}
const port = port_arg
console.log(port)
if (!config.plugins.length)
    throw new Error('Empty plugins list')

config.plugins
	.filter(name => 
		fs.readdirSync('./src/plugins/').indexOf(name + '.js') > -1)
	.forEach(name => require('./plugins/' + name))

app.listen(port, () => {
	db.init()
		.then(initMsg => {
			console.log(initMsg)
			console.log(`App listening on port ${port}`)
		})
		.catch(err => console.error(err))
})