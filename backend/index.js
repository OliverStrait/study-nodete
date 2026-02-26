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

const ENV = process.env


function main() {
    const app = express()

    try {
        const demo = require("./demo-routes")
        demo.demo(ENV.DEMO, app)
        console.log("⚠️  DEMO set is loaded")
    }
    catch (e) {
        console.log("❌ NO demos", e)
    }

    const PORT = ENV.PORT || 5000;
    app.listen(PORT, () => { console.log(`✅ Node server is listening @ ${PORT}`) })

    if (ENV.DEV == "true") {
        app.use(morgan("dev"))
        app.use((req, res, next) => {
            console.log("[DEV]: ", req.method, ":", req.url)
            next()
        })
    }

    app.use(express.static('html'))
    app.use(error.error_endware(ENV.DEV))
}

main()
