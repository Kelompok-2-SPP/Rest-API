const express = require("express");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../../domain/const");
const { FixedResponse } = require("../../domain/utils");

const app = express();
const petugas = require("../../data/services/petugas");
const siswa = require("../../data/services/siswa");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  // Fetch data from body
  const { username, nisn, password } = req.body;

  // Check if had username
  if (username) {
    await petugas
      .getAllPetugasByUsername(username)
      .then((data) => {
        if (data) {
          let allowed = false;
          
          for (a of data) {
            console.log(a.password)
            console.log(pass)
            if (a.password == pass) {
              allowed = true;
            }
          }

          if (allowed) {
            res.status(200).json(
              new FixedResponse(
                (code = res.statusCode),
                (message = "Authorized"),
                (details = {
                  logged: true,
                  token: jwt.sign(
                    JSON.stringify(found, [
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
        res.status(500).json(new FixedResponse((code = res), (message = err)));
      });
  } else if (nisn) {
    await siswa
      .getAllSiswaById(nisn)
      .then((data) => {
        if (data) {
          const pass = passEncrypt(nisn, password);
          let allowed = false;

          for (a of data) {
            if (a.password == pass) {
              allowed = true;
            }
          }

          if (allowed) {
            res.status(200).json(
              new FixedResponse(
                (code = res.statusCode),
                (message = "Authorized"),
                (details = {
                  logged: true,
                  token: jwt.sign(
                    JSON.stringify(found, [
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
                (message = "Wrong username or password combination"),
                (details = {
                  logged: false,
                  token: null,
                })
              )
            );
          }
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
        res.status(500).json(new FixedResponse((code = res), (message = err)));
      });
  } else {
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required body is missing !, " +
            (await checkNull([username, nisn, password])))
        )
      );
  }
});

module.exports = app;
