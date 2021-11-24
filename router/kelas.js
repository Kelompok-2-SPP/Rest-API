const express = require("express");
const sequelize = require("sequelize");
const models = require("../models/index");
const verify = require("./verify");
const app = express();

const Op = sequelize.Op;
const kelas = models.kelas;

app.use(verify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let data = {};
  for (key in req.query) {
    data[key] = {
      [Op.like]: `%${req.query[key]}%`,
    };
  }
  await kelas
    .findAll({
      where: data,
      order: [["nama_kelas", "ASC"]],
    })
    .then((kelas) => {
      if (kelas.length > 0) {
        res.status(200).json({
          status: res.statusCode,
          message: "",
          details: kelas,
        });
      } else {
        res.status(404).json({
          status: res.statusCode,
          message: "Data were not found",
          details: null,
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
});

app.post("/", async (req, res) => {
  if (req.body.nama_kelas && req.body.jurusan && req.body.angkatan) {
    const data = ({ nama_kelas, jurusan, angkatan } = req.body);
    await kelas
      .findOne({ where: { nama_kelas: data.nama_kelas } })
      .then((duplicate) => {
        if (!duplicate) {
          kelas
            .create(data)
            .then((result) => {
              res.status(201).json({
                status: res.statusCode,
                message: "Data has been inserted",
                details: result,
              });
            })
            .catch((error) => {
              res.status(500).json({
                status: res.statusCode,
                message: "Something went wrong on server side",
                details: error.message,
              });
            });
        } else {
          res.status(409).json({
            status: res.statusCode,
            message: "Nama kelas has been used",
            details: "Try different nama_kelas",
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
      details: "Needed body is nama_kelas, jurusan, angkatan",
    });
  }
});

app.put("/", async (req, res) => {
  if (req.body.id_kelas) {
    let data = {};
    for (key in req.body) {
      data[key] = req.body[key];
    }
    await kelas
      .findOne({ where: { nama_kelas: data.nama_kelas } })
      .then((find) => {
        if (!find) {
          kelas
            .update(data, { where: { id_kelas: data.id_kelas } })
            .then((scss) => {
              if (scss[0]) {
                kelas
                  .findOne({ where: { id_kelas: data.id_kelas } })
                  .then((resu) => {
                    res.status(200).json({
                      status: res.statusCode,
                      message: "Data succesfully updated",
                      details: resu,
                    });
                  })
                  .catch((error) => {
                    res.status(500).json({
                      status: res.statusCode,
                      message: "Something went wrong on server side",
                      details: error.message,
                    });
                  });
              } else {
                res.status(404).json({
                  status: res.statusCode,
                  message: "Data were not found",
                  details: null,
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
          res.status(409).json({
            status: res.statusCode,
            message: "Nama kelas has been used",
            details: "Try different nama_kelas",
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
      details: "Needed body is id_kelas, and nama_kelas or jurusan or angkatan",
    });
  }
});

app.delete("/", async (req, res) => {
  if (req.query.id_kelas) {
    await kelas
      .findOne({ where: { id_kelas: req.query.id_kelas } })
      .then((resu) => {
        if (resu) {
          kelas
            .destroy({ where: { id_kelas: req.query.id_kelas } })
            .then(
              res.status(200).json({
                status: res.statusCode,
                message: "Data succesfully deleted",
                details: resu,
              })
            )
            .catch((error) => {
              res.status(500).json({
                status: res.statusCode,
                message: "Something went wrong on server side",
                details: error.message,
              });
            });
        } else {
          res.status(404).json({
            status: res.statusCode,
            message: "Data were not found",
            details: null,
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
      message: "Required params is missing !",
      details: "Needed params is id_kelas",
    });
  }
});

module.exports = app;
