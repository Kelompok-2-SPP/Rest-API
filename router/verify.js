const jwt = require("jsonwebtoken")

auth_verify = (req, res, next) => {
    // get jwt from header
    let header = req.headers.authorization
    let token = null

    if (header != null) {
        // get token from second side
        token = header.split(" ")[1]
    }

    if (token == null) {
        res.status(401).json({
            status: res.statusCode,
            message: "Unauthorized",
            details: "Put token on headers"
        })
    } else {
        // jwt
        let jwtHeader = {
            algorithm: "HS256"
        }

        let secretKey1 = "petugasSPP"
        let secretKey2 = "siswaSPP"

        jwt.verify(token, secretKey1, jwtHeader, err => {
            if (err) {
                jwt.verify(token, secretKey2, jwtHeader, err => {
                    if (err) {
                        res.status(401).json({
                            status: res.statusCode,
                            message: "Token innvalid or expired",
                            token: token
                        })
                    } else {
                        next()
                    }
                })
            } else {
                next()
            }
        })
    }
}


module.exports = auth_verify