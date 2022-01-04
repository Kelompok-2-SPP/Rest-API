const jwt = require("jsonwebtoken");

let token = null;

auth_verify = (req, res, next) => {
  const secretKey = {
    petugas: "petugasSPP",
    siswa: "siswaSPP",
  };
  const jwtHeader = {
    algorithm: "HS256",
  };

  // get jwt from header
  let header = req.headers.authorization;

  if (header != null) {
    // get token from second side
    token = header.split(" ")[1];
  }

  if (token == null) {
    res.status(401).json({
      status: res.statusCode,
      message: "Unauthorized, Put token on headers",
      details: null,
    });
  } else {
    jwt.verify(token, secretKey.petugas, jwtHeader, (err) => {
      if (err) {
        jwt.verify(token, secretKey.siswa, jwtHeader, (err) => {
          if (err) {
            res.status(401).json({
              status: res.statusCode,
              message: "Token invalid",
              details: {
                logged: false,
                token: token,
              },
            });
          } else {
            next();
          }
        });
      } else {
        next();
      }
    });
  }
};

access_roles = (roles) => {
  return (req, res, next) => {
    decoded = jwt.decode(token, { complete: true });
    allowed = false;

    for (x of roles) {
      if (x == decoded.level) {
        allowed = true;
      }
    }

    if (allowed) {
      next();
    } else {
      res.status(401).json({
        status: res.statusCode,
        message: "Unauthorized, You're not allowed to using this method",
        details: null,
      });
    }
  };
};

module.exports = {
  auth_verify,
  access_roles,
};
