const express = require("express");
const models = require("../../data/models/index");
const { passDecrypt } = require("../../domain/utils");
const { secretKey } = require("../../domain/const");
const jwt = require("jsonwebtoken");

const app = express();
const petugas = models.petugas;
const siswa = models.siswa;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  if (req.body.username) {
    await petugas
      .findOne({ where: { username: req.body.username } })
      .then(async (found) => {
        if (found) {
          if (await passDecrypt(req.body.username, req.body.password, found.password)) {
            res.status(200).json({
              status: res.statusCode,
              message: "Authorized",
              details: {
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
              },
            });
          } else {
            res.status(401).json({
              status: res.statusCode,
              message: "Wrong Username or Password combination",
              details: {
                logged: false,
                token: null,
              },
            });
          }
        } else {
          res.status(401).json({
            status: res.statusCode,
            message: "Wrong Username or Password combination",
            details: {
              logged: false,
              token: null,
            },
          });
        }
      })
      .catch((error) => {
        console.log(error)
        res.status(500).json({
          status: res.statusCode,
          message: "Something went wrong on server side, " + error.message,
          details: null,
        });
      });
  } else if (req.body.nisn) {
    await siswa
      .findOne({
        where: { nisn: req.body.nisn },
      })
      .then(async (found) => {
        if (found) {
          if (await passDecrypt(req.body.nisn, req.body.password, found.password)) {
            res.status(200).json({
              status: res.statusCode,
              message: "Authorized",
              details: {
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
              },
            });
          } else {
            res.status(401).json({
              status: res.statusCode,
              message: "Wrong Nisn or Password combination",
              details: {
                logged: false,
                token: null,
              },
            });
          }
        } else {
          res.status(401).json({
            status: res.statusCode,
            message: "Wrong Nisn or Password combination",
            details: {
              logged: false,
              token: null,
            },
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          status: res.statusCode,
          message: "Something went wrong on server side, " + error.message,
          details: null,
        });
      });
  } else {
    res.status(500).json({
      status: res.statusCode,
      message: "Something went wrong on server side, " + error.message,
      details: null,
    });
  }
});

module.exports = app;
