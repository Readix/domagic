const fs = require('fs')
const log = require('./logger')
const config = require('./config')
const { Pool, Client } = require('pg')

let dbPool = undefined

function initDB(user, password) {
	dbPool = new Pool({
		user: user,
		host: 'localhost',
		database: 'smart-layout',
		password: password
	})
}

module.exports = {
	init: initDB,
	addAuthorization: async function (auth) {
		let query = `INSERT INTO Installations(user_id, team_id, scope, access_token, token_type) VALUES(${auth.user_id}, ${auth.team_id}, ${auth.scope}, ${auth.access_token}, ${auth.token_type})`
		return dbPool.query(query)
			.catch(err => {
				err.code == 23505 ?  // unique violation
					log.trace(err.stack):
					log.error(err.stack)
			})
	},
	addRequest: async (user, team, data, status) => {
		let query = `SELECT insert_request(${user}, ${team}, ${data}, ${status})`
		dbPool.query(query)
			.catch(err => log.error(err.stack))
	},
	addConfig: async (data) => {
		let query = `SELECT insert_config(${data})`
		dbPool.query(query)
			.catch(err => log.error(err.stack))
	},
	startSession: async (user, team) => {
		let query = `SELECT start_session(${user}, ${team})`
		dbPool.query(query)
			.catch(err => log.error(err.stack))
	},
	endSession: async (user, team) => {
		let query = `SELECT end_session(${user}, ${team})`
		dbPool.query(query)
			.catch(err => log.error(err.stack))
	},
	getPluginProps: async function() {
		let query = 'SELECT * FROM Plugins LIMIT 1'
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => log.error(err.stack))
	}
}
