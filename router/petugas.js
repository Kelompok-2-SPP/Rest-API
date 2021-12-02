const express = require("express");
const sequelize = require("sequelize");
const md5 = require("md5");
const models = require("../models/index");
const verify = require("./verify");
const app = express();

const Op = sequelize.Op;
const petugas = models.petugas;

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
  await petugas
    .findAll({
      where: data,
      order: [["nama_petugas", "ASC"]],
      attributes: { exclude: ["password"] },
    })
    .then((result) => {
      if (result.length > 0) {
        res.status(200).json({
          status: res.statusCode,
          message: "",
          details: result,
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
    req.body.username &&
    req.body.password &&
    req.body.nama_petugas &&
    req.body.level
  ) {
    let data = ({ username, nama_petugas, level } = req.body);
    data["password"] = md5(req.body.password);
    await petugas
      .findOne({ where: { username: data.username } })
      .then((duplicate) => {
        if (!duplicate) {
          petugas
            .create(data)
            .then((result) => {
              delete result.dataValues.password;
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
            message: "Username has been used",
            details: "Try different username",
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
      details: "Needed body is username, password, nama_petugas, level",
    });
  }
});

app.put("/", access_roles(["admin"]), async (req, res) => {
  if (req.body.id_petugas) {
    let data = {};

    for (key in req.body) {
      data[key] = req.body[key];
    }

    if (data.password) {
      data["password"] = md5(data.password);
    }

    if (data.username) {
      await petugas
        .findOne({ where: { username: data.username } })
        .then(() => {
          res.status(409).json({
            status: res.statusCode,
            message: "Username has been used",
            details: "Try different username",
          });
        })
        .catch((error) => {
          res.status(500).json({
            status: res.statusCode,
            message: "Something went wrong on server side",
            details: error.message,
          });
        });
    }

    await petugas
      .update(data, { where: { id_petugas: data.id_petugas } })
      .then((scss) => {
        if (scss[0]) {
          petugas
            .findOne({ where: { id_petugas: data.id_petugas } })
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
      message: "Required body is missing !",
      details:
        "Needed body is id_petugas, and username or password or nama_petugas or level",
    });
  }
});

app.delete("/", access_roles(["admin"]), async (req, res) => {
  if (req.query.id_petugas) {
    await petugas
      .findOne({ where: { id_petugas: req.query.id_petugas } })
      .then((resu) => {
        if (resu) {
          delete resu.dataValues.password;
          petugas
            .destroy({ where: { id_petugas: req.query.id_petugas } })
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
      details: "Needed params is id_petugas",
    });
  }
});

module.exports = app;
