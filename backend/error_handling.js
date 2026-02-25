
/** HttpError to construct invariant errors. 
 * It is used in pair with errorEndware
 * 
 */
class HttpError {
    /**
     * 
     * @param {number} status http status code
     * @param {string} full Full detailed message for development
     * @param {string} safe Production message
     */
    constructor(status = 500, full = "", safe = "") {
        this.status = status
        this.full = full
        this.safe = safe
    }
    /**Copy of object with stack trace of calling time
     *  @param {Error} err
     * @returns HttpError
     */
    trace(err) {
        let stack = (err ? err.stack : Error("httpErrInternal").stack).split("\n")
        let new_err = Object.assign({}, this)
        new_err.stack = err ? stack : stack.slice(2, stack.length - 1)
        return new_err

    }
}

/** Error handling  express endware
 * 
 * @param {boolean} DEV with flag server send and print more information about errors.
 */
function error_endware(DEV = false) {
    if (DEV) {
        /**
         * 
         * @param {Error, HttpError} err 
         */
        return (err, req, res, next) => {
            let exception = Error.isError(err)
            if (exception) {
                console.log("unexpected error", err)
                res.status(500)
                next(err)
            }
            else {
                if (err?.full) {
                    res.status(err.status)
                    res.statusMessage = err.full
                    res.json(err)
                }
            }
            console.warn(`[ERR Response: ${res.statusCode}] @`, req.path)
        }
    }
    else {
        /**
 * 
 * @param {Error, HttpError} err 
 */
        return (err, req, res, next) => {
            if (Error.isError(err)) {
                console.warn("[PROD] INTERNAL ERROR", err)
                res.status(500)
            }
            else if (err?.safe) {
                res.status(err.status)
                res.statusMessage = err.safe
            }
            if (res.statusCode == 200) { res.status(500) }
            res.end()
        }
    }
}


module.exports = { error_endware, HttpError }