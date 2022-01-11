const express = require("express");
const sequelize = require("sequelize");
const models = require("../../data/models/index");
const { authVerify, accessLimit } = require("../../domain/utils");
const app = express();

const Op = sequelize.Op;
const kelas = models.kelas;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let data = {};

  if (req.query.keyword) {
    data = {
      [Op.or]: [
        {
          nama_kelas: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          jurusan: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          angkatan: { [Op.like]: `%${req.query.keyword}%` },
        },
      ],
    };
  } else {
    for (key in req.query) {
      data[key] = req.query[key];
    }
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
        message: "Something went wrong on server side, " + error.message,
        details: null,
      });
    });
});

app.post("/", accessLimit(["admin"]), async (req, res) => {
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
                message:
                  "Something went wrong on server side, " + error.message,
                details: null,
              });
            });
        } else {
          res.status(409).json({
            status: res.statusCode,
            message: "Nama kelas has been used, Try different nama_kelas",
            details: null,
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
    res.status(422).json({
      status: res.statusCode,
      message:
        "Required body is missing !, Needed body is nama_kelas, jurusan, angkatan",
      details: null,
    });
  }
});

app.put("/", accessLimit(["admin"]), async (req, res) => {
  if (req.body.id_kelas) {
    let data = {};
    for (key in req.body) {
      data[key] = req.body[key];
    }
    if (data.nama_kelas) {
      await kelas
        .findOne({
          where: {
            nama_kelas: data.nama_kelas,
            id_kelas: {
              [Op.ne]: data.id_kelas,
            },
          },
        })
        .then((namakelas) => {
          if (namakelas) {
            res.status(409).json({
              status: res.statusCode,
              message: "Nama kelas has been used, Try different nama_kelas",
              details: null,
            });
          } else {
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
                        message:
                          "Something went wrong on server side, " +
                          error.message,
                        details: null,
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
                  message:
                    "Something went wrong on server side" + error.message,
                  details: null,
                });
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
    }
  } else {
    res.status(422).json({
      status: res.statusCode,
      message:
        "Required body is missing !, Needed body is id_kelas, and nama_kelas or jurusan or angkatan",
      details: null,
    });
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
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
                message: "Something went wrong on server side" + error.message,
                details: null,
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
          message: "Something went wrong on server side, " + error.message,
          details: null,
        });
      });
  } else {
    res.status(422).json({
      status: res.statusCode,
      message: "Required params is missing !, Needed params is id_kelas",
      details: null,
    });
  }
});

module.exports = app;
