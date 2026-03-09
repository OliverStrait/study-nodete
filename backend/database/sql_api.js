const mysql = require("mysql2/promise")


class DbApi {
    constructor(db_settings, pool = true) {
        if (pool) {
            this.createPoolConnection(db_settings)
        }
        else { this.create_connection(db_settings) }

    }
    async createPoolConnection(pool_setting) {
        try {
            this.db = await mysql.createPool(pool_setting)
            console.log("✅ Pool Database is connected to: ", this.db.pool.config.connectionConfig.host)
        }
        catch (err) {
            throw Error("‼️ [FATAL]: Could not connect to database", { cause: err })
        }
    }
    async create_connection(db_settings) {
        try {
            this.db = await mysql.createConnection(db_settings)
            console.log("✅ Database is connected to: ", this.db.config.host)
        }
        catch (err) {
            console.debug(`‼️ [FATAL]: ${err.message} error:[${err.code}, ${err.errno}]`)
            throw Error("‼️ [FATAL]: Could not connect to database", { cause: err })
        }
    }

    static non_empty_result(result) {
        let rows = result[0]
        if (!rows.length == 0) {
            return result
        }
        else {
            let new_err = Error("Database return no results")
            throw new_err
        }
    }
    async execute(query, params) {
        try {
            let result = await this.db.execute(query, params)
            return result
        }
        catch (err) {
            throw new Error("Database failure", { cause: err })
        }

    }
    async query(query, params) {
        let result = await this.db.query(query, params)
        return result
    }
}

module.exports = { DbApi }