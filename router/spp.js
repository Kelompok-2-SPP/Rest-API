const express = require("express");
const sequelize = require("sequelize");
const models = require("../models/index");
const verify = require("./verify");
const app = express();

const Op = sequelize.Op;
const spp = models.spp;

app.use(verify);
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
        message: "Something went wrong on server side",
        details: error.message,
      });
    });
});

app.post("/", access_roles(["admin"]), async (req, res) => {
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
          message: "Something went wrong on server side",
          details: error.message,
        });
      });
  } else {
    res.status(422).json({
      status: res.statusCode,
      message: "Required body is missing !",
      details: "Needed body is tahun, nominal, angkatan",
    });
  }
});

app.put("/", access_roles(["admin"]), async (req, res) => {
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
      details: "Needed body is id_spp, and tahun or nominal or angkatan",
    });
  }
});

app.delete("/", access_roles(["admin"]), async (req, res) => {
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
      details: "Needed params is id_spp",
    });
  }
});

module.exports = app;
