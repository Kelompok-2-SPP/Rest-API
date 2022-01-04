const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secretKey } = require("./const");

// Initiate token as null
let token = null;

// Response interface
class FixedResponse {
  constructor(code = 500, message = "", details = null) {
    // Error handling and response
    switch (code) {
      // case 404
      case 404:
        this.status = code;
        this.message = "Data were not found";
        this.details = details;
        break;
      // case 500
      case 500:
        this.status = code;
        this.message =
          "Something went wrong on server side, " + message.message;
        this.details = details;
        break;
      // default response
      default:
        this.status = code;
        this.message = message;
        this.details = details;
    }
  }
}

// Paged Response interface
class Paged {
  constructor(content = null, totalPages = 1) {
    this.content = content;
    this.totalPages = totalPages;
  }
}

// Check nuul
checkNull = (data) => {
  let nullData = "";

  // literate through data
  for (a of data) {
    if (a == null) {
      nullData += Object.keys({ a })[0] + ", ";
    }
  }

  return (nullData += ".");
};

// Verify aaccount
authVerify = (req, res, next) => {
  const jwtHeader = {
    algorithm: "HS256",
  };

  // get header
  const header = req.headers.authorization;
  // check if token is null or not, if yes throw error to user
  if (!header) {
    token = header.split(" ")[1];
  } else {
    res.status(401).json(
      new FixedResponse(
        (code = res.statusCode),
        (message = "Put token on headers"),
        (details = {
          logged: false,
          token: null,
        })
      )
    );
  }

  jwt.verify(token, secretKey.petugas, jwtHeader, (err) => {
    if (err) {
      jwt.verify(token, secretKey.siswa, jwtHeader, (err) => {
        if (err) {
          res.status(401).json(
            new FixedResponse(
              (code = res.statusCode),
              (message = "Token invalid"),
              (details = {
                logged: false,
                token: token,
              })
            )
          );
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });
};

// Roles access
accessLimit = (roles) => {
  return (req, res, next) => {
    const dcdToken = jwt.verify(token, secretKey.petugas, { complete: true });
    let allowed = false;

    // check role
    for (x of roles) {
      if (x == dcdToken.level) {
        allowed = true;
      }
    }

    if (allowed) {
      next();
    } else {
      res
        .status(401)
        .json(
          new FixedResponse(
            (code = res.statusCode),
            (message = "Unauthorized, You're not allowed to using this method")
          )
        );
    }
  };
};

passEncrypt = async (username, password) => {
  const saltRound = 10;
  let pas = "";

  if (!Number.isNaN(username)) {
    pas = username + password + secretKey.siswa;
  } else {
    pas = username + password + secretKey.petugas;
  }

  // Begin encryption using bcrypt
  return await bcrypt.hash(pas, saltRound)
};

passDecrypt = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed)
};

module.exports = {
  Paged,
  passEncrypt,
  authVerify,
  FixedResponse,
  accessLimit,
  checkNull,
};
