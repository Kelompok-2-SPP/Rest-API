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
      // case 400
      case 400:
        this.status = code;
        this.message = "Bad request, please read the documentation";
        this.details = details;
        break;
      // case 500
      case 500:
        this.status = code;
        this.message = "Something went wrong on server side, " + message;
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
  constructor(count = 0, content = null, totalPages = 0) {
    this.count = count;
    this.content = content;
    this.totalPages = isNaN(totalPages) ? 1 : totalPages;
  }
}

// Check nuul
checkNull = async (data) => {
  let nullData = "";

  // literate through data
  for (const [keys, values] of Object.entries(data)) {
    if (values == null) {
      nullData += ", " + keys;
    }
  }

  return nullData;
};

// Verify aaccount
authVerify = async (req, res, next) => {
  const jwtHeader = {
    algorithm: "HS256",
  };

  // get header
  const header = req.headers.authorization;

  // check if token is null or not, if yes throw error to user
  if (header != null) {
    token = header.split(" ")[1];

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
};

// Roles access
accessLimit = (roles) => {
  return (req, res, next) => {
    jwt.verify(token, secretKey.petugas, { complete: true }, (err, dcdToken) => {
      if (err) {
        res
          .status(405)
          .json(
            new FixedResponse(
              (code = res.statusCode),
              (message =
                "Unauthorized, You're not allowed to using this method")
            )
          );
      } else {
        let allowed = false;

        // check role
        for (x of roles) {
          if (x == dcdToken.payload.level) {
            allowed = true;
          }
        }

        if (allowed) {
          next();
        } else {
          res
            .status(405)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message =
                  "Unauthorized, You're not allowed to using this method")
              )
            );
        }
      }
    });
  };
};

passEncrypt = async (type, password) => {
  const saltRound = 10;
  let pas = "";

  if (type == "siswa") {
    pas = password + secretKey.siswa;
  } else {
    pas = password + secretKey.petugas;
  }

  // Begin encryption using bcrypt
  return await bcrypt.hash(pas, saltRound);
};

passDecrypt = async (type, password, hashed) => {
  let pas = "";

  if (type == "siswa") {
    pas = password + secretKey.siswa;
  } else {
    pas = password + secretKey.petugas;
  }

  return await bcrypt.compare(pas, hashed);
};

verifyDate = (date) => {
  if (!/^\d\d\/\d\d\/\d\d\d\d$/.test(date)) {
    return false;
  }
  const [dd, mm, yyyy] = date.split("/").map((p) => parseInt(p));
  parts[mm] -= 1;
  const d = new Date(dd, mm, yyyy);
  return d.getDate() === dd && d.getMonth() === mm && d.getFullYear() === yyyy;
};

module.exports = {
  Paged,
  passEncrypt,
  passDecrypt,
  authVerify,
  FixedResponse,
  accessLimit,
  checkNull,
  verifyDate,
};
