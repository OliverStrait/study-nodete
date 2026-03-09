const error = require("./error_handling")
const express = require("express")

const BASIC_ERROR = new error.HttpError(400, "DEMO known error caused by [client error]", "Bad Request")


function route(app) {
    let route = express.Router()
    console.log("⚠️  DEMO set is loaded")
    route.get("/error", (req, res, next) => {
        let erro = BASIC_ERROR
        next(erro)
    })

    route.get("/ex", (req, res, next) => {
        throw Error("This is DEMO of internal Unexpected error from module...")
    })
    return route

}

module.exports = { route }