const express = require("express");
const services = require("../../data/services");
const {
  FixedResponse,
  authVerify,
  accessLimit,
  checkNull,
} = require("../../domain/utils");
const { errorHandling } = require("../../domain/const");

const app = express();
const siswa = services.siswa;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- GET
app.get("/", async (req, res) => {
  // Fetch data from query params
  const { nisn, keyword, size, page } = req.query;

  // Check if have nisn param
  if (nisn) {
    // Call services getSiswabyId
    await siswa
      .getSiswabyId(nisn)
      .then((data) => {
        // Check data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
        } else {
          res
            .status(200)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message = ""),
                (details = data)
              )
            );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Call services getSiswa
    await siswa
      .getSiswa(keyword, size, page)
      .then((data) => {
        // Check data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
          res
            .status(200)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message = ""),
                (details = data)
              )
            );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  }
});

// -- POST
app.post("/", accessLimit(["admin"]), async (req, res) => {
  // Fetch data from body
  const { nisn, password, nis, nama, id_kelas, alamat, no_telp } = req.body;

  // Check if have required body
  if (nisn && password && nis && nama && id_kelas && alamat && no_telp) {
    // Call services insertSiswa
    await siswa
      .insSiswa(nisn, password, nis, nama, id_kelas, alamat, no_telp)
      .then((data) => {
        if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
        } else if (data == errorHandling.DOUBLE_DATA) {
          res
            .status(409)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message =
                  "Nisn " +
                  nisn +
                  " or nis " +
                  nis +
                  " has been used, try different nisn or nis")
              )
            );
        } else if (data == errorHandling.INDEX_NOT_FOUND) {
          res
            .status(409)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message =
                  "Id kelas " +
                  id_kelas +
                  " not found, please check the data before submitting")
              )
            );
        } else {
          // Return data to user
          res
            .status(201)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message = "Data sucessfully inserted"),
                (details = data)
              )
            );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res.status(422).json(
      new FixedResponse(
        (code = res.statusCode),
        (message =
          "Required body is missing !" +
          (await checkNull({
            nisn,
            password,
            nis,
            nama,
            id_kelas,
            alamat,
            no_telp,
          })))
      )
    );
  }
});

app.put("/", accessLimit(["admin"]), async (req, res) => {
  // Fetch data from body
  const { nisn } = req.query;
  const { nis } = req.body;
  const new_nisn = req.body.nisn;

  // Check if have required body
  if (nisn) {
    // Call services putSiswa
    await siswa
      .putSiswa(nisn, req.body)
      .then((data) => {
        // Check if bad req or not
        if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
          // Check if data not found
        } else if (data == errorHandling.DOUBLE_DATA) {
          res
            .status(409)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message =
                  "Nisn " +
                  new_nisn +
                  " or nis " +
                  nis +
                  " has been used, try different nisn or nis")
              )
            );
        } else if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else if (data == errorHandling.INDEX_NOT_FOUND) {
          res
            .status(409)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message =
                  "Id kelas " +
                  id_kelas +
                  " not found, please check the data before submitting")
              )
            );
        } else {
          res
            .status(200)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message = "Data sucessfuly updated"),
                (details = data)
              )
            );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required query params is missing !, nisn, body (optional) nisn (as new nisn) or password or nis or nama or id_kelas or alamat or no_telp")
        )
      );
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
  // Ftech data from query
  const { nisn } = req.query;

  // Check if have required query
  if (nisn) {
    // Call services delSiswa
    await siswa
      .delSiswa(nisn)
      .then((data) => {
        // Check if data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
          // Check if data not found
        } else {
          res
            .status(200)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message = "Data sucessfuly deleted"),
                (details = data)
              )
            );
        }
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message = "Required query params is missing !, nisn")
        )
      );
  }
});

module.exports = app;
