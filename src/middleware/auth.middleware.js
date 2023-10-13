const db = require("../config/db.config");
const jwt = require("jsonwebtoken");


const verifyToken = (request, response, next) => {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    if (!token) {
        return response.status(403).json({
            status: 403,
            message: "A token is required for authentication"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRETKEY);
        request.user = decoded
    } catch (err) {
        return response.status(401).json({
            status: 401,
            message: "Invalid Token"
        });
    }
    return next();
};

 

module.exports = verifyToken;