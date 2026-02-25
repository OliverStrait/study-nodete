const error = require("./error_handling")


const BASIC_ERROR = new error.HttpError(401, "Internal error that is caused by", "You are dirty")


function demo(dev, app) {
    if (dev) {
        app.get("/error", (req, res, next) => {
            let erro = BASIC_ERROR.trace(Error("asd"))
            next(erro)
        })

        app.get("/ex", (req, res, next) => {
            throw Error("This is internal Unexpected error from module...")
        })
    }
}

module.exports = { demo }