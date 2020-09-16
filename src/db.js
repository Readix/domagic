const fs = require('fs')
const log = require('./logger')
const config = require('./config')
const { Pool, Client } = require('pg')

let dbErrorFormat = (func, query, message) => 
	`db module error in ${func}:\nquery: ${query}\n${message}`
let dbPool = undefined

function initDB() {
	dbPool = new Pool({
		user: config.DB_USER,
		host: 'localhost',
		database: 'smart-layout',
		password: config.DB_PASS
	})
}

module.exports = {
	init: initDB,
	addAuthorization: async function (auth, client_id) {
		let query = `INSERT INTO Installations(user_id, team_id, client_id, scope, access_token, token_type) 
								 VALUES('${auth.user_id}', '${auth.team_id}', '${client_id}', '${auth.scope}', '${auth.access_token}', '${auth.token_type}')
								 ON CONFLICT ON CONSTRAINT unique_installation 
								 DO UPDATE SET user_id='${auth.user_id}',
															 team_id='${auth.team_id}',
															 client_id='${client_id}',
															 scope='${auth.scope}',
															 access_token='${auth.access_token}',
															 token_type='${auth.token_type}';`
		return dbPool.query(query)
			.catch(err => {
				let errString = dbErrorFormat('addAuthorization', query, err.stack)
				err.code == 23505 ?  // unique violation
					log.trace(errString):
					log.error(errString)
			})
	},
	addPlugin: async function (name, client_id, client_secret) {
		let query = `INSERT INTO Plugins(name, client_id, client_secret) VALUES('${name}', '${client_id}', '${client_secret}')`
		dbPool.query(query)
			.catch(err => log.error(dbErrorFormat('addPlugin', query, err.stack)))
	},
	addRequest: async (user, team, data, status) => {
		let query = `SELECT insert_request(${user}, ${team}, '${data}', '${status}')`
		console.log(user," ",team);
		dbPool.query(query)
			.catch(err => log.error(dbErrorFormat('addRequest', query, err.stack)))
	},
	addConfig: async (data) => {
		let query = `SELECT insert_config('${data}')`
		dbPool.query(query)
			.catch(err => log.error(dbErrorFormat('addConfig', query, err.stack)))
	},
	startSession: async (user, team) => {
		let query = `SELECT start_session(${user}, ${team})`
		dbPool.query(query)
			.catch(err => log.error(dbErrorFormat('startSession', query, err.stack)))
	},
	endSession: async (user, team) => {
		let query = `SELECT end_session(${user}, ${team})`
		dbPool.query(query)
			.catch(err => log.error(dbErrorFormat('endSession', query, err.stack)))
	},
	getPluginProps: async function(name) {
		let query = `SELECT * FROM Plugins WHERE name = '${name}'`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => log.error(dbErrorFormat('getPluginProps', query, err.stack)))
	}
}
