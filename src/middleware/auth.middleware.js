const db = require("../config/db.config");
const jwt = require("jsonwebtoken");

const verifyToken = (request, response, next) => {
  const BearerToken = request.headers["authorization"];
  if (!BearerToken) {
    return response.status(403).json({
      status: 403,
      message: "A token is required for authentication",
    });
  }
  try {
    const token = BearerToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    request.user = decoded;
  } catch (err) {
    return response.status(401).json({
      status: 401,
      message: "Invalid Token",
    });
  }
  return next();
};

const createToken = (userId) => {
  const payload = {
    id: userId,
  };
  const accessToken = jwt.sign(
    {
      data: payload,
    },
    process.env.SECRET_KEY
  );

  const refreshToken = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      data: payload,
    },
    process.env.REFRESH_SECRET_KEY
  );

  return { accessToken, refreshToken };
};

module.exports = { createToken, verifyToken };
