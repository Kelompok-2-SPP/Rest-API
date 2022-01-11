const express = require("express");
const sequelize = require("sequelize");
const models = require("../../data/models/index");
const { authVerify, accessLimit } = require("../../domain/utils");
const app = express();

const Op = sequelize.Op;
const spp = models.spp;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let data = {};
  if (req.query.keyword) {
    data = {
      [Op.or]: [
        {
          angkatan: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          tahun: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          nominal: { [Op.like]: `%${req.query.keyword}%` },
        },
      ],
    };
  } else {
    for (key in req.query) {
      data[key] = req.query[key];
    }
  }
  await spp
    .findAll({
      where: data,
      order: [["tahun", "ASC"]],
    })
    .then((spp) => {
      if (spp.length > 0) {
        res.status(200).json({
          status: res.statusCode,
          message: "",
          details: spp,
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
  if (req.body.tahun && req.body.nominal && req.body.angkatan) {
    const data = ({ tahun, nominal, angkatan } = req.body);
    await spp
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
          message: "Something went wrong on server side, " + error.message,
          details: null,
        });
      });
  } else {
    res.status(422).json({
      status: res.statusCode,
      message:
        "Required body is missing !, Needed body is tahun, nominal, angkatan",
      details: null,
    });
  }
});

app.put("/", accessLimit(["admin"]), async (req, res) => {
  if (req.body.id_spp) {
    let data = {};
    for (key in req.body) {
      data[key] = req.body[key];
    }
    await spp
      .update(data, { where: { id_spp: data.id_spp } })
      .then((scss) => {
        if (scss[0]) {
          spp
            .findOne({ where: { id_spp: data.id_spp } })
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
  } else {
    res.status(422).json({
      status: res.statusCode,
      message:
        "Required body is missing !, Needed body is id_spp, and tahun or nominal or angkatan",
      details: null,
    });
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
  if (req.query.id_spp) {
    await spp
      .findOne({ where: { id_spp: req.query.id_spp } })
      .then((resu) => {
        if (resu) {
          spp
            .destroy({ where: { id_spp: req.body.id_spp } })
            .then(
              res.status(200).json({
                status: res.statusCode,
                message: "Data succesfully deleted",
                data: resu,
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
      message: "Required params is missing !, Needed params is id_spp",
      details: null,
    });
  }
});

module.exports = app;
