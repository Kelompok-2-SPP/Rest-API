const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { secretKey, dbConfig, jwtHeader } = require("./const");

// Initiate token as null
let token = null;

// Response interface
class FixedResponse {
  constructor(code = 500, message = "", details = null) {
    this.status = code;
    // Error handling and response
    switch (code) {
      // case 404
      case 404:
        this.message = "Data were not found";
        break;
      // case 400
      case 400:
        this.message = "Bad request, please read the documentation";
        break;
      // case 500
      case 500:
        this.message = "Something went wrong on server side, " + message;
        break;
      // default response
      default:
        this.message = message;
    }
    this.details = details;
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

// Tunggakan Response interface
class Tunggakan {
  constructor(
    nisn = null,
    jumlahTunggakan = 0,
    totalTunggakan = 0,
    tunggakan = null
  ) {
    this.nisn = nisn;
    this.jumlah_tunggakan = jumlahTunggakan;
    this.total_tunggakan = totalTunggakan;
    this.tunggakan = tunggakan;
  }
}

// Check nuul
checkNull = async (data) => {
  let nullData = "";

  // literate through data
  for (const [keys, values] of Object.entries(data)) {
    nullData += values == null ? ", " + keys : "";
  }

  return nullData;
};

// Verify aaccount
authVerify = async (req, res, next) => {
  // get header
  const header = req.headers.authorization;

  // check if token is null or not, if yes throw error to user
  if (header != null) {
    token = header.split(" ")[1];

    jwt.verify(
      token,
      secretKey.petugas,
      jwtHeader + { complete: true },
      (err, dcd) => {
        if (err) {
          jwt.verify(
            token,
            secretKey.siswa,
            jwtHeader + { complete: true },
            (err, dcd) => {
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
                req.payload = dcd.payload;
                next();
              }
            }
          );
        } else {
          req.payload = dcd.payload;
          next();
        }
      }
    );
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
  return async (req, res, next) => {
    jwt.verify(
      token,
      secretKey.petugas,
      { complete: true },
      (err, dcdToken) => {
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
      }
    );
  };
};

passEncrypt = async (type, password) => {
  const saltRound = 10;

  // Begin encryption using bcrypt
  return await bcrypt.hash(
    type == "siswa" ? password + secretKey.siswa : password + secretKey.petugas,
    saltRound
  );
};

passDecrypt = async (type, password, hashed) => {
  return await bcrypt.compare(
    type == "siswa" ? password + secretKey.siswa : password + secretKey.petugas,
    hashed
  );
};

verifyDate = (date) => {
  return {
    date:
      moment(date, "DD/MM/YYYY", true).isValid() ||
      moment(date, "D/MM/YYYY", true).isValid() ||
      moment(date, "DD/M/YYYY", true).isValid() ||
      moment(date, "D/M/YYYY", true).isValid(),
    day:
      moment(date, "DD", true).isValid() || moment(date, "D", true).isValid(),
    month:
      moment(date, "MM", true).isValid() || moment(date, "M", true).isValid(),
    year: moment(date, "YYYY", true).isValid(),
  };
};

passedMonth = (date) => {
  const now = moment(moment.now()).utcOffset(dbConfig.timezone);
  const dat = moment(date, "MM/YYYY");

  const diff = now.diff(dat, "months", true);
  return Math.round(diff);
};

module.exports = {
  Paged,
  Tunggakan,
  passEncrypt,
  passDecrypt,
  authVerify,
  FixedResponse,
  accessLimit,
  checkNull,
  verifyDate,
  passedMonth,
};
