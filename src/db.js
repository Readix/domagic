const fs = require('fs')
const log = require('./logger')
const config = require('./config')
const { Pool, Client } = require('pg')
const path = require('path');
const srcDir = path.join(__dirname, '..')


let dbErrorFormat = (func, query, err) => {
	err.src = `db func: ${func}`
	err.query = query
	return err
}

let dbPool = undefined

const testDbPool = () => {
	return dbPool.connect()
		.then(() => 'success connecion')
		.catch(err => {throw Error(err)})
}

const initDB = async () => {
	let config = require('./config.json')
	if (!dbPool) {
		dbPool = new Pool({
			user: config.db_user,
			host: 'localhost',
			database: config.db_name,
			password: config.db_pass
		})
	}
	return testDbPool()
}

module.exports = {
	init: initDB,
	request: async function (query){
		return dbPool.query(query)
			.catch(err => log.error(dbErrorFormat('request', query, err.stack)))
	},
	getInstallation: async function (user_id, team_id, client_id) {
		let query = `SELECT * FROM Installations WHERE user_id=${user_id} and team_id=${team_id} client_id=${client_id}`
		return dbPool.query(query)
			.catch(err => log.error(dbErrorFormat('addPlugin', query, err.stack)))
	},
	addAuthorization: async function (auth, client_id) {
		let query = `INSERT INTO Installations(user_id, team_id, client_id, scope, access_token, token_type) 
								VALUES('${auth.user_id}', '${auth.team_id}', '${client_id}', '${auth.scope}', '${auth.access_token}', '${auth.token_type}')
								ON CONFLICT ON CONSTRAINT unique_installation
								DO UPDATE SET user_id='${auth.user_id}',
															team_id='${auth.team_id}',
															client_id='${client_id}',
															scope='${auth.scope}',
															access_token='${auth.access_token}',
															token_type='${auth.token_type}'
								RETURNING "install_id";`;
		return dbPool.query(query)
			.then(res => res.rows[0]['install_id'])
			.catch(err => {
				throw dbErrorFormat('addAuthorization', query, Error(err))})
	},
	addPlugin: async function (name, client_id, client_secret, is_paid) {
		let query = `INSERT INTO Plugins(name, client_id, client_secret, src, is_paid) 
			VALUES('${name}','${client_id}', '${client_secret}','${srcDir}', ${is_paid})`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('addPlugin', query, Error(err))})
	},
	addRequest: async (access_token, data, status) => {
		data = data.replace("'", "")
		let query = `SELECT insert_request('${access_token}', '${data}', '${status}')`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('addRequest', query, Error(err))})
	},
	addConfig: async (data) => {
		data = data.replace("'", "")
		let query = `SELECT insert_config('${data}')`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('addConfig', query, Error(err))})
	},
	startSession: async (access_token) => {
		let query = `SELECT start_session('${access_token}')`
		return dbPool.query(query)
			.then(res => query)
			.catch(err => {
				throw dbErrorFormat('startSession', query, Error(err))})
	},
	endSession: async (access_token) => {
		let query = `SELECT end_session('${access_token}')`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('endSession', query, Error(err))})
	},
	getPluginProps: async function(name) {
		let query = `SELECT * FROM Plugins WHERE name = '${name}' and src = '${srcDir}'`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('getPluginProps', query, Error(err))})
	},
	pluginExists: async (pluginName) => {
		let query = `SELECT * FROM Plugins \
			WHERE name = '${pluginName}' and src = '${srcDir}'`
		return dbPool.query(query)
			.then(res => res.rows.length != 0)
			.catch(err => {
				throw dbErrorFormat('pluginExists', query, Error(err))})
	},
	getSecret: async (pluginName) => {
		let query = `SELECT client_secret FROM Plugins \
			WHERE name = '${pluginName}' and src = '${srcDir}'`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('getSecret', query, Error(err))})
	},
	deletePlugin: async (pluginName) => {
		let query = `delete FROM Plugins WHERE name = '${pluginName}' and src = '${srcDir}'`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('deletePlugin', query, Error(err))})
	},
	changePluginProps: async (pluginName, client_id, client_secret) => {
		let query = `update Plugins set client_id = ${client_id}, client_secret = ${client_secret}\
			WHERE name = '${pluginName}' and src = '${srcDir}'`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('changePluginProps', query, Error(err))})
	},
	getPluginsList: async () => {
		let query = `select name, client_id, client_secret, is_paid from Plugins\
			where src = '${srcDir}'`
		return dbPool.query(query)
			.then(res => res.rows)
			.catch(err => {
				throw dbErrorFormat('getPluginsList', query, Error(err))})
	},
	addFeedback: async (access_token, rated, grade, comment) => {
		let query = `INSERT INTO Feedbacks (access_token, rated, grade, comment)
		VALUES('${access_token}','${rated}','${grade}','${comment}')`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('addFeedback', query, Error(err))})
	},
	isRated: async (access_token) => {
		let query = `SELECT rated FROM Feedbacks WHERE access_token='${access_token}'`;
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('isRated', query, Error(err))})
	},
	authorized: async (access_token, pluginName) => {
		let query =`select * from installations as i join plugins as p
			on i.client_id = p.client_id
			where
			p.src = '${srcDir}' and
			i.access_token = '${access_token}'`
		if (pluginName) {
			query += ` and p.name = '${pluginName}'`
		}
		return dbPool.query(query)
			.then(res=> res.rows.length > 0)
			.catch(err => {
				throw dbErrorFormat('authorized', query, Error(err))})
	},
	addPayWindow: async function (pluginName, info) {
		let query = `INSERT INTO Paykeys("client_id", "info") values ((
			select "client_id" from Plugins where "name" = '${pluginName}'), '${info}')
			returning "paykey";`;
		return dbPool.query(query)
			.then(res => res.rows[0]['paykey'])
			.catch(err => {
				throw dbErrorFormat('addPayWindow', query, Error(err))})
	},
	availablePaykeyWindow: async function (paykey) {
		let query = `select "install_id" is null as "available" from Paykeys
			where "paykey" = '${paykey}';`;
		return dbPool.query(query)
			.then(res => res.rows[0]['available'])
			.catch(err => {
				throw dbErrorFormat('addPayWindow', query, Error(err))})
	},
	isPaid: async function (pluginName) {
		let query = `select "is_paid" from Plugins where "name" = '${pluginName}';`;
		return dbPool.query(query)
			.then(res => res.rows[0]['is_paid'])
			.catch(err => {
				throw dbErrorFormat('isPaid', query, Error(err))})
	},
	addPayInstallation: async function (paykey, installId) {
		let query = `update Paykeys set "install_id" = ${installId} where "paykey" = '${paykey}';`;
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('addAuthorization', query, Error(err))})
	},
	// admin's functions
	getPaysInfo: async function (pluginName) {
		let query = `SELECT pk."paykey", pk."info", pk."install_id" FROM Paykeys as pk
					join Plugins as pl using("client_id")
					where pl.name = '${pluginName}'`;
		return dbPool.query(query)
			.then(res => res.rows)
			.catch(err => {
				throw dbErrorFormat('getPaysInfo', query, Error(err))})
	}
}
