const ERR_NAME = "ErrorCarrier_"


/** HttpError is used to construct invariant HTTP-errors and message pairs.
 * Full message describe detailed version of error.
 * Safe is for generic version of error without implementation details
 * It is used in pair with errorEndware
 * 
 */
class HttpError {
    name = ERR_NAME
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

    full_msg() {
        return { status: this.status, msg: this.full }
    }
    safe_msg() {
        return { status: this.status, msg: this.safe }
    }
}


/** Error handling  express endware
 * 
 * @param {boolean} DEV with flag server send and print more information about errors.
 */
function error_endware(DEV = false) {
    function parse_error(error, res) {
        if (error?.name == ERR_NAME) {
            let detail = DEV ? error.full_msg() : error.safe_msg()
            return detail
        }
        else {
            const { statusCode, statusMessage } = res
            return {
                status: (statusCode == 200) ? 500 : statusCode,
                msg: statusMessage ?? "Internal Server Error",
                stack: (error?.stack ?? "").split("\n")
            }
        }
    }
    function set_basic(err, res) {
        let detail = parse_error(err, res)
        res.statusMessage = detail.msg
        res.status(detail.status)
        return detail
    }
    if (DEV) {
        return function dev_error(err, req, res, next) {
            let detail = set_basic(err, res)
            console.info(`[ERR Response: ${detail.status}] @`, req.path)
            res.json(detail).end()
        }
    }
    else {

        return function production_error(err, req, res, next) {
            let detail = set_basic(err, res)

            if (detail.status >= 500 && detail.status < 600) {
                console.warn("Unexpected", err)
            }
            res.end()
        }
    }
}

module.exports = { error_endware, HttpError }