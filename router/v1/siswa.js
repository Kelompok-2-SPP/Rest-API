const express = require("express");
const sequelize = require("sequelize");
const models = require("../../data/models/index");
const { authVerify, accessLimit } = require("../../domain/utils");
const app = express();

const Op = sequelize.Op;
const siswa = models.siswa;
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
          nisn: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          nis: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          nama: { [Op.like]: `%${req.query.keyword}%` },
        },
      ],
    };
  } else {
    for (key in req.query) {
      data[key] = req.query[key];
    }
  }

  await siswa
    .findAll({
      where: data,
      order: [["nama", "ASC"]],
      attributes: { exclude: ["password"] },
      include: [
        "kelas",
        {
          model: kelas,
          as: "kelas",
        },
      ],
    })
    .then((siswa) => {
      if (siswa.length > 0) {
        res.status(200).json({
          status: res.statusCode,
          message: "",
          details: siswa,
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
  if (
    req.body.nisn &&
    req.body.password &&
    req.body.nis &&
    req.body.nama &&
    req.body.id_kelas &&
    req.body.alamat &&
    req.body.no_telp
  ) {
    let data = ({ nisn, nis, nama, id_kelas, alamat, no_telp } = req.body);
    data["password"] = await passEncrypt("siswa", data.password);
    await siswa
      .findOne({
        where: {
          [Op.or]: [
            {
              nisn: data.nisn,
            },
            {
              nis: data.nis,
            },
          ],
        },
      })
      .then(async (duplicate) => {
        if (!duplicate) {
          await siswa
            .create(data)
            .then(async (result) => {
              await siswa
                .findOne({
                  where: { nisn: nisn },
                  attributes: { exclude: ["password"] },
                  include: [
                    "kelas",
                    {
                      model: kelas,
                      as: "kelas",
                    },
                  ],
                })
                .then((result) => {
                  res.status(201).json({
                    status: res.statusCode,
                    message: "Data has been inserted",
                    data: result,
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
            message: "Nisn or Nis has been used, Try different nisn or nis",
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
        "Required body is missing !, Needed body is nisn, password, nis, nama, id_kelas, alamat, no_telp",
      details: null,
    });
  }
});

app.put("/", accessLimit(["admin"]), async (req, res) => {
  if (req.body.nisn) {
    let nisn = true;
    let nis = true;
    let data = {};

    for (key in req.body) {
      data[key] = req.body[key];
    }

    if (data.new_nisn) {
      data["nisn"] = req.body.new_nisn;
      delete data["new_nisn"];
      await siswa
        .findOne({
          where: {
            [Op.and]: [
              {
                nisn: data.nisn,
              },
              {
                nisn: { [Op.ne]: req.body.nisn },
              },
            ],
          },
        })
        .then((find) => {
          if (find) {
            nisn = false;
          } else {
            nisn = true;
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

    if (data.nis) {
      await siswa
        .findOne({
          where: {
            [Op.and]: [
              {
                nis: data.nis,
              },
              {
                nisn: { [Op.ne]: req.body.nisn },
              },
            ],
          },
        })
        .then((find) => {
          if (find) {
            nis = false;
          } else {
            nis = true;
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

    if (data.password) {
      data["password"] = await passEncrypt("siswa", data.password);
    }

    if (nisn && nis) {
      await siswa
        .update(data, { where: { nisn: req.body.nisn } })
        .then(async (scss) => {
          if (scss[0]) {
            await siswa
              .findOne({
                where: {
                  nisn: data.nisn,
                },
                include: [
                  "kelas",
                  {
                    model: kelas,
                    as: "kelas",
                  },
                ],
                attributes: { exclude: ["password"] },
              })
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
                    "Something went wrong on server side, " + error.message,
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
    } else if (!nisn || !nis) {
      res.status(409).json({
        status: res.statusCode,
        message: "Nisn or Nis has been used, Try different nisn or nis",
        details: null,
      });
    }
  } else {
    res.status(422).json({
      status: res.statusCode,
      message:
        "Required body is missing !, Needed body is nisn, and new_nisn or nis or nama or id_kelas or alamat or no_telp",
      details: null,
    });
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
  if (req.query.nisn) {
    await siswa
      .findOne({
        where: { nisn: req.query.nisn },
        include: [
          "kelas",
          {
            model: kelas,
            as: "kelas",
          },
        ],
        attributes: { exclude: ["password"] },
      })
      .then(async (resu) => {
        if (resu) {
          await siswa
            .destroy({ where: { nisn: req.query.nisn } })
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
                message:
                  "Something went wrong on server side, " + error.message,
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
      message: "Required params is missing !, Needed params is nisn",
      details: null,
    });
  }
});

module.exports = app;
