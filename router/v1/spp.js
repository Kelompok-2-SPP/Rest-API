const express = require("express");
const sequelize = require("sequelize");
const models = require("../../data/models/index");
const services = require("../../data/services");
const { errorHandling } = require("../../domain/const");
const { authVerify, accessLimit } = require("../../domain/utils");
const app = express();

const Op = sequelize.Op;
const spp = models.spp;
const serviceSpp = services.spp;

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
      order: [["tahun", "DESC"]],
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

app.get("/latest", async (req, res) => {
  // Fetch data from query params
  const { nisn, year } = req.query;

  if (nisn) {
    await serviceSpp.getLatestSpp(nisn, year).then((data) => {
      if (data == errorHandling.BAD_REQ) {
        res.status(400).json({
          status: res.statusCode,
          message: "Bad request, please read the documentation",
          details: null,
        });
      } else if (data == errorHandling.NOT_FOUND) {
        res.status(404).json({
          status: res.statusCode,
          message: "Data were not found",
          details: null,
        });
      } else {
        res.status(200).json({
          status: res.statusCode,
          message: "",
          details: data,
        });
      }
    });
  } else {
    res.status(422).json({
      status: res.statusCode,
      message: "Required params is missing !, Needed params is nisn, year",
      details: null,
    });
  }
});

app.post("/", accessLimit(["admin"]), async (req, res) => {
  if (req.body.angkatan && req.body.tahun && req.body.nominal) {
    const data = ({ angkatan, tahun, nominal } = req.body);
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
        "Required body is missing !, Needed body is angkatan, tahun, nominal",
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
      .then(async (scss) => {
        if (scss[0]) {
          await spp
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
        "Required body is missing !, Needed body is id_spp, and angkatan or tahun or nominal",
      details: null,
    });
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
  if (req.query.id_spp) {
    await spp
      .findOne({ where: { id_spp: req.query.id_spp } })
      .then(async (resu) => {
        if (resu) {
          await spp
            .destroy({ where: { id_spp: req.query.id_spp } })
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
      message: "Required params is missing !, Needed params is id_spp",
      details: null,
    });
  }
});

module.exports = app;
