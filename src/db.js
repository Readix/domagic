const fs = require('fs')
const config = require('./config')
const {QueryError, PoolError} = require('./errors')
const mariadb = require('mariadb')

let dbPool = []

function initDB(user, password) {
	dbPool = mariadb.createPool({host: 'localhost', user: user, password: password, connectionLimit: 10})
}
function runQuery(query){
	dbPool.getConnection()
	.then(conn => {
		conn.query(query)
		.then(res => {
			return res
		})
		.catch(err => {
			throw new QueryError(query, err)
		})
	})
	.catch( err => {
		throw new PoolError(dbPool, err)
	})
}

module.exports = {
	init: initDB,
	addAuthorization: async function (auth) {
		let query = `INSERT IGNORE INTO Installations(user_id, team_id, scope, access_token, token_type) VALUES(${auth.user_id}, ${auth.team_id}, ${auth.scope}, ${auth.access_token}, ${auth.token_type})`
		await runQuery(query)
	},
	getPluginProps: async function() {
		let query = 'SELECT * FROM Plugins LIMIT 1'
		res = await runQuery(query)
		return res.rows[0]
	}
}
