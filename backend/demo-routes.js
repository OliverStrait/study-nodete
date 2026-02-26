const error = require("./error_handling")


const BASIC_ERROR = new error.HttpError(400, "DEMO known error caused by [client error]", "Bad Request")


function demo(dev, app) {
    if (dev) {
        app.get("/error", (req, res, next) => {
            let erro = BASIC_ERROR
            next(erro)
        })

        app.get("/ex", (req, res, next) => {
            throw Error("This is DEMO of internal Unexpected error from module...")
        })
    }
}

module.exports = { demo }