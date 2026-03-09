const bcrypt = require("bcrypt");
const db = require("../database/sql_api")
const error = require("../error_handling").HttpError

/** Remove schema-header from token part (ex. Bearer, Basic)*/
function parseAuthHeader(type) {
    const reqEX_search = new RegExp("^" + type + `\\s+(.+)$`, "i")
    return function parseToken(token) {
        const m = token.match(reqEX_search);
        return m ? m[1].trim() : "";
    }
}


const INVALID_REG = new error(400, "Invalid data for User registration", "User registration failed, invalid client data")


class AUTH {
    constructor(DBAPI) {
        this.db = DBAPI
    }

    async login(data) {
        console.log("AUTH login", data)
        const { password, username } = data
        let db_user = await this.db.get_user(username)
        console.log("LOGIN DB result", db_user)
        let user = db_user[0][0]
        console.log("In auth login db result_", user)
        if (user.passhash = await bcrypt.hash(password, user.hash_salt)) {
            const sessio_token = crypto.randomUUID()
            let new_sessio = await this.db.add_auth_sessio(sessio_token, user.uuid, user.user_id)
            return sessio_token
        }
        // console.log("this is result", result)

    }
    // register(req, res, next) { }
    async logout(session_token) {
        console.log("THIS IS LOGOUT", session_token)
        let result = await this.db.logout(session_token)
    }

    verify(req, res, next) {
        // Use Map to store local cache of token. 
        // Short time like minutes until cache incvalidate and data is fetched from cache.
    }

    async register(data) {

        const { password, username, email } = data
        const salt = await bcrypt.genSalt()
        const hashpass = await bcrypt.hash(password, salt)
        const uuid = crypto.randomUUID()
        await this.db.new_user(username, email, uuid, salt, hashpass)
        await this.db.add_priviledge(uuid, "user")

        return { password, username, }

    }


}


class AUTH_DB extends db.DbApi {
    constructor(db_settings) {
        super(db_settings)
    }

    async logout(session) {
        this.db.query("UPDATE auth_session SET invalid = 0 WHERE uuid = ?  ", [session])
    }

    async new_user(username, email, uuid, salt, passhash,) {
        console.log("New user insertion")

        let result = await this.query(`INSERT INTO auth_user (email, UUID, NAME, hash_salt, passhash) 
VALUES (?,?,?,?,?)`, [email, uuid, username, salt, passhash])
        // console.log("New user")
        return result
    }

    async get_user(name) {
        console.log("SELECT * FROM auth_user,", name, "|")
        return await this.execute("SELECT * FROM  auth_user WHERE name = ?", [name])
    }

    async add_priviledge(uuid, level = "user") {
        return await this.execute(NEW_PRIVILEDGE, [level, uuid])
    }

    async add_auth_sessio(session_uuid, user_uuid, user_id) {
        return await this.query(NEW_SESSIO, [session_uuid, user_uuid, user_id])
    }
}

const NEW_SESSIO = `INSERT INTO auth_session (uuid, expire, user_uuid, user_id) 
            VALUES (?,  DATE_ADD(NOW(), INTERVAL 1 HOUR), ?,?)`
const NEW_USER = `INSERT INTO auth_user (email, UUID, NAME,hash_salt, passhash) 
VALUES (?,?,?,?,?)`
const NEW_PRIVILEDGE = `INSERT INTO auth_priviledge (ROLE_ID, user_id)
VALUES ((SELECT role_id FROM auth_role 
WHERE title = ?), (SELECT user_id FROM auth_user WHERE UUID = ? ))`
const USER_AUTH = `
SELECT * FROM auth_user
INNER JOIN (SELECT creation , removed, auth_level, user_id FROM auth_priviledge INNER JOIN auth_role USING (role_id) ) AS DT
 USING (user_id)
WHERE (UUID = "564d4190-170e-11f1-8419-9c2dcd3fae5a") AND (DT.removed IS NULL) 
ORDER BY DT.auth_level DESC;`

module.exports = { AUTH, AUTH_DB, parseAuthHeader }