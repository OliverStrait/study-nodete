const express = require("express")
const error = require("../error_handling").HttpError
const bcrypt = require("bcrypt");

const INVALID_REG = new error(400, "Invalid data for User registration", "User registration failed, invalid client data")
const INVALID_BODY = new error(400, "Invalid body", "Invalid body")


function AuthRoute(auth_scheme) {
    const AUTH = auth_scheme
    let route = express.Router()

    async function login(req, res, next) {
        const token = await AUTH.login(req.body)
        res.json({ token: token, type: "Basic" })
    }

    /**Register middleware
    * in succes it redirect to login process.
    */
    async function register(req, res, next) {
        try {
            const { password, username, email } = req.body
            if (!username || !password || !email) {
                console.log("Invalid body")
                next(INVALID_REG)
            }
            await AUTH.register(req.body)
            next()
        }
        catch (e) {
            if (e.name == "TypeError") {
                next(INVALID_BODY)
                throw e
            }
        }

    }

    route.post("/login", login)
    route.post("/register", register, login)

    route.post("/logout", async (req, res, next) => {
        const { session_token } = req.body
        console.log("In logoute route,", AUTH, session_token)
        await AUTH.logout(session_token)
        res.end()

    })

    return route
}

module.exports = { AuthRoute }