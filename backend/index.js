const NODE_ENV = process.env.NODE_ENV
require("dotenv").config({
    path: (NODE_ENV == "development") ? "dev.env" : ((NODE_ENV == "test") ? "test.env" : null),
    debug: (NODE_ENV == "development" || NODE_ENV == "test") ? true : false,
    quiet: true,
})

const morgan = require("morgan")
const mysql = require("mysql2")
const express = require("express")

const error = require("./error_handling")
// const db = require("./database/sql_api")


const auth = require("./authentication/auth_API")
const auth_router = require("./authentication/auth_route")

const ENV = process.env

const DB_DEF_CONN = {
    host: ENV.DB_HOST,
    user: ENV.DB_USER,
    password: ENV.DB_PASS,
    database: ENV.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // multipleStatements: true,
}

// const DATABASE = new db.DbApi(DB_DEF_CONN)
const AUTH = new auth.AUTH(new auth.AUTH_DB(DB_DEF_CONN))
function main() {
    const app = express()

    if (ENV.DEMO) {
        const demo = require("./demo-routes")
        app.use("/demo", demo.route())
    }
    app.use((req, res, next) => {
        console.log(req.body)
        next()
    })
    const PORT = ENV.PORT || 5000;
    app.listen(PORT, () => { console.log(`✅ Node server is listening @ ${PORT}`) })

    app.use(express.json())
    if (ENV.DEV == "true") {
        app.use(morgan("dev"))
        app.use((req, res, next) => {
            console.log("[DEV]: ", req.method, ":", req.url)
            console.log("\tbody:", req.body)
            next("route")
        })
    }
    // app.use(express.json())

    // app.get("/db", AUTH.register.bind(AUTH), (req, res,) => {
    //     // AUTH.register()s
    //     res.end()
    // }
    // )
    app.use("/api/auth/", auth_router.AuthRoute(AUTH))

    app.get("/download", (req, res, next) => {
        let path = __dirname + "/html/index.html"
        console.log("path", path)
        res.sendFile(path)
    })

    app.use(express.static('html'))
    app.use(error.error_endware(ENV.DEV))

}
main()
