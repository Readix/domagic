const config = require('./config')
const { Pool, Client } = require('pg')

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
	if (!dbPool) {
		dbPool = new Pool({
			user: config.DB_USER,
			host: 'localhost',
			database: config.DB_NAME,
			password: config.DB_PASS
		})
	}
	return testDbPool()
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
				throw dbErrorFormat('addAuthorization', query, Error(err))})
	},
	addPlugin: async function (name, client_id, client_secret, src) {
		let query = `INSERT INTO Plugins(name, client_id, client_secret, src) \
			VALUES('${name}', '${client_id}', '${client_secret}', '${src}')`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('addPlugin', query, Error(err))})
	},
	addRequest: async (user, team, data, status) => {
		let query = `SELECT insert_request(${user}, ${team}, '${data}', '${status}')`
		console.log(user," ",team);
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('addRequest', query, Error(err))})
	},
	addConfig: async (data) => {
		let query = `SELECT insert_config('${data}')`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('addConfig', query, Error(err))})
	},
	startSession: async (user, team) => {
		let query = `SELECT start_session(${user}, ${team})`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('startSession', query, Error(err))})
	},
	endSession: async (user, team) => {
		let query = `SELECT end_session(${user}, ${team})`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('endSession', query, Error(err))})
	},
	getPluginProps: async function(name) {
		let query = `SELECT * FROM Plugins WHERE name = '${name}'`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('getPluginProps', query, Error(err))})
	},
	pluginExists: async (pluginName, src) => {
		let query = `SELECT * FROM Plugins \
			WHERE name = '${pluginName}' and src = '${src}'`
		return dbPool.query(query)
			.then(res => res.rows.length != 0)
			.catch(err => {
				throw dbErrorFormat('pluginExists', query, Error(err))})
	},
	getSecret: async (pluginName) => {
		let query = `SELECT client_secret FROM Plugins WHERE name = '${pluginName}'`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('getSecret', query, Error(err))})
	},
	deletePlugin: async (pluginName, src) => {
		let query = `delete FROM Plugins WHERE name = '${pluginName}' and src = '${src}'`
		return dbPool.query(query)
			.catch(err => {
				throw dbErrorFormat('deletePlugin', query, Error(err))})
	},
	changePluginProps: async (pluginName, client_id, client_secret, src) => {
		let query = `update Plugins set client_id = ${client_id}, client_secret = ${client_secret}\
			WHERE name = '${pluginName}' and src = '${src}'`
		return dbPool.query(query)
			.then(res => res.rows[0])
			.catch(err => {
				throw dbErrorFormat('changePluginProps', query, Error(err))})
	},
	getPluginsList: async (src) => {
		let query = `select name, client_id, client_secret from Plugins\
			where src = '${src}'`
		return dbPool.query(query)
			.then(res => res.rows)
			.catch(err => {
				throw dbErrorFormat('getPluginsList', query, Error(err))})	
	}
}
