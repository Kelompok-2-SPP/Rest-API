const express = require("express");
const sequelize = require("sequelize");
const md5 = require("md5");
const models = require("../../data/models/index");
const { authVerify, accessLimit, passEncrypt } = require("../../domain/utils");
const app = express();

const Op = sequelize.Op;
const petugas = models.petugas;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let data = {};

  if (req.query.keyword) {
    data = {
      [Op.or]: [
        {
          username: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          nama_petugas: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          level: { [Op.like]: `%${req.query.keyword}%` },
        },
      ],
    };
  } else {
    for (key in req.query) {
      data[key] = req.query[key];
    }
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
        message: "Something went wrong on server side, " + error.message,
        details: null,
      });
    });
});

app.post("/", accessLimit(["admin"]), async (req, res) => {
  if (
    req.body.username &&
    req.body.password &&
    req.body.nama_petugas
  ) {
    let data = ({ username, nama_petugas, level } = req.body);
    data["password"] = await passEncrypt(data.username, data.password);
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
                message:
                  "Something went wrong on server side, " + error.message,
                details: null,
              });
            });
        } else {
          res.status(409).json({
            status: res.statusCode,
            message: "Username has been used, Try different username",
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
        "Required body is missing !, Needed body is username, password, nama_petugas, level (optional)",
      details: null,
    });
  }
});

app.put("/", accessLimit(["admin"]), async (req, res) => {
  if (req.body.id_petugas) {
    let data = {};

    for (key in req.body) {
      data[key] = req.body[key];
    }

    if (data.password) {
      await petugas
        .findOne({ where: { id_petugas: data.id_petugas } })
        .then(async(user) => {
          if (user) {
            data["password"] = await passEncrypt(user.username, data.password);
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
    }

    if (data.username) {
      await petugas
        .findOne({
          where: {
            username: data.username,
            id_petugas: {
              [Op.ne]: data.id_petugas,
            },
          },
        })
        .then((surname) => {
          if (surname) {
            res.status(409).json({
              status: res.statusCode,
              message: "Username has been used, Try different username",
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
      message:
        "Required body is missing !, Needed body is id_petugas, and username or nama_petugas or level",
      details: null,
    });
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
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
      message: "Required params is missing !, Needed params is id_petugas",
      details: null,
    });
  }
});

module.exports = app;
