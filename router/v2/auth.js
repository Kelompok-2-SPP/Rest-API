const express = require("express");
const jwt = require("jsonwebtoken");
const services = require("../../data/services");
const { secretKey, errorHandling } = require("../../domain/const");
const { FixedResponse, passDecrypt, checkNull } = require("../../domain/utils");

const app = express();
const petugas = services.petugas;
const siswa = services.siswa;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  // Fetch data from body
  const { username, nisn, password } = req.body;

  // Check if had username
  if (username && password) {
    await petugas
      .getPetugasByUsername(username)
      .then(async (data) => {
        if (
          data != errorHandling.NOT_FOUND &&
          data != errorHandling.BAD_REQ &&
          (await passDecrypt("petugas", password, data.password))
        ) {
          res.status(200).json(
            new FixedResponse(
              (code = res.statusCode),
              (message = "Authorized"),
              (details = {
                logged: true,
                token: jwt.sign(
                  JSON.stringify(data, [
                    "id_petugas",
                    "username",
                    "nama_petugas",
                    "level",
                    "createdAt",
                    "updatedAt",
                  ]),
                  secretKey.petugas
                ),
              })
            )
          );
        } else {
          res.status(401).json(
            new FixedResponse(
              (code = res.statusCode),
              (message = "Wrong username or password combination"),
              (details = {
                logged: false,
                token: null,
              })
            )
          );
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json(new FixedResponse((code = res.statusCode), (message = err)));
      });
  } else if (nisn && password) {
    await siswa
      .getSiswabyIdAuth(nisn)
      .then(async (data) => {
        if (
          data != errorHandling.NOT_FOUND &&
          data != errorHandling.BAD_REQ &&
          (await passDecrypt("siswa", password, data.password))
        ) {
          res.status(200).json(
            new FixedResponse(
              (code = res.statusCode),
              (message = "Authorized"),
              (details = {
                logged: true,
                token: jwt.sign(
                  JSON.stringify(data, [
                    "nisn",
                    "nis",
                    "nama",
                    "id_kelas",
                    "alamat",
                    "no_telp",
                    "cretedAt",
                    "updatedAt",
                  ]),
                  secretKey.siswa
                ),
              })
            )
          );
        } else {
          res.status(401).json(
            new FixedResponse(
              (code = res.statusCode),
              (message = "Wrong nisn or password combination"),
              (details = {
                logged: false,
                token: null,
              })
            )
          );
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json(new FixedResponse((code = res.statusCode), (message = err)));
      });
  } else {
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required body is missing !, username or nisn" +
            (await checkNull({ password })))
        )
      );
  }
});

module.exports = app;
