class DataBaseError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}
class QueryError extends DataBaseError {
    constructor(query, err=null) {
        super(`Query Error: ${err}\n Query: ${query}`)
    }
}
class PoolError extends DataBaseError {
    constructor(pool, err) {
        super(`Pool error: ${err}`)
        this.data = {pool: pool}
    }
}

module.exports = {
    QueryError,
    PoolError
}