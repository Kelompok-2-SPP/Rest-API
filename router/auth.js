const express = require("express");
const models = require("../models/index");
const md5 = require("md5");
const jwt = require("jsonwebtoken");

const app = express();
const petugas = models.petugas;
const siswa = models.siswa;
const secretKey = {
  petugas: "petugasSPP",
  siswa: "siswaSPP",
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  if (req.body.username) {
    await petugas
      .findOne({ where: { username: req.body.username } })
      .then((found) => {
        if (found) {
          if (found.password == md5(req.body.password)) {
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
                token: null
              }
            });
          }
        } else {
          res.status(401).json({
            status: res.statusCode,
            message: "Wrong Username or Password combination",
            details: {
              logged: false,
              token: null
            }
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          status: res.statusCode,
          message: "Something went wrong on server side",
          details: error.message,
        });
      });
  } else if (req.body.nisn) {
    await siswa
      .findOne({
        where: { nisn: req.body.nisn },
      })
      .then((found) => {
        if (found) {
          if (found.password == md5(req.body.password)) {
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
              message: "Wrong Username or Password combination",
              details: {
                logged: false,
                token: null
              }
            });
          }
        } else {
          res.status(401).json({
            status: res.statusCode,
            message: "Wrong Username or Password combination",
            details: {
              logged: false,
              token: null
            }
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          status: res.statusCode,
          message: "Something went wrong on server side",
          details: error.message,
        });
      });
  } else {
    res.status(422).json({
      status: res.statusCode,
      message: "Required body is missing !",
      details: "Needed body is username or nisn, password",
    });
  }
});

module.exports = app;
