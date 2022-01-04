const express = require("express");
const sequelize = require("sequelize");
const md5 = require("md5");
const models = require("../../data/models/index");
const { auth_verify, access_roles } = require("./verify");
const app = express();

const Op = sequelize.Op;
const siswa = models.siswa;

app.use(auth_verify);
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
        {
          alamat: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          no_telp: { [Op.like]: `%${req.query.keyword}%` },
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
        message: "Something went wrong on server side",
        details: error.message,
      });
    });
});

app.post("/", access_roles(["admin"]), async (req, res) => {
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
    data["password"] = md5(req.body.password);
    await siswa
      .findOne({ where: { nisn: data.nisn, nis: data.nis } })
      .then((duplicate) => {
        if (!duplicate) {
          siswa
            .create(data)
            .then((result) => {
              delete result.dataValues.password;
              res.status(201).json({
                status: res.statusCode,
                message: "Data has been inserted",
                data: result,
              });
            })
            .catch((error) => {
              res.status(500).json({
                status: res.statusCode,
                message: "Something went wrong on server side" + error.message,
                details: null,
              });
            });
        } else {
          res.status(409).json({
            status: res.statusCode,
            message: "Nisn or Nis has been used",
            details: "Try different nisn or nis",
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
      details:
        "Needed body is nisn, password, nis, nama, id_kelas, alamat, no_telp, id_spp",
    });
  }
});

app.put("/", access_roles(["admin"]), async (req, res) => {
  if (req.body.nisn) {
    let data = {};

    for (key in req.body) {
      data[key] = req.body[key];
    }

    if (req.body.new_nisn) {
      delete data["new_nisn"];
      data["nisn"] = req.body.new_nisn;
    }

    if (data.password) {
      delete data["password"];
    }

    await siswa
      .update(data, { where: { nisn: req.body.nisn } })
      .then((scss) => {
        if (scss[0]) {
          siswa
            .findOne({ where: { nisn: data.nisn } })
            .then((resu) => {
              delete resu.dataValues.password;
              res.status(200).json({
                status: res.statusCode,
                message: "Data succesfully updated",
                details: resu,
              });
            })
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
          message: "Something went wrong on server side",
          details: error.message,
        });
      });
  } else {
    res.status(422).json({
      status: res.statusCode,
      message: "Required body is missing !",
      details:
        "Needed body is nisn, and new_nisn or nis or nama or id_kelas or alamat or no_telp or id_spp",
    });
  }
});

app.delete("/", access_roles(["admin"]), async (req, res) => {
  if (req.query.nisn) {
    await siswa
      .findOne({ where: { nisn: req.query.nisn } })
      .then((resu) => {
        if (resu) {
          delete resu.dataValues.password;
          siswa
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
          message: "Something went wrong on server side",
          details: error.message,
        });
      });
  } else {
    res.status(422).json({
      status: res.statusCode,
      message: "Required params is missing !",
      details: "Needed params is nisn",
    });
  }
});

module.exports = app;
