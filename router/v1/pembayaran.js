const express = require("express");
const sequelize = require("sequelize");
const models = require("../../data/models/index");
const services = require("../../data/services");
const { authVerify, accessLimit } = require("../../domain/utils");
const { errorHandling } = require("../../domain/const");
const app = express();

const Op = sequelize.Op;
const pembayaran = models.pembayaran;
const siswa = models.siswa;
const petugas = models.petugas;
const spp = models.spp;
const kelas = models.kelas;
const tunggakan = services.tunggakan;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let data = {};
  let orders = [["updatedAt", "DESC"]];

  if (req.query.keyword) {
    data = {
      [Op.or]: [
        {
          tgl_bayar: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          bulan_spp: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          tahun_spp: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          jumlah_bayar: { [Op.like]: `%${req.query.keyword}%` },
        },
      ],
    };
  } else {
    for (key in req.query) {
      data[key] = req.query[key];
    }
  }

  if (req.query.nisn) {
    orders = [
      ["tahun_spp", "DESC"],
      ["bulan_spp", "DESC"],
    ];
  }

  await pembayaran
    .findAll({
      where: data,
      include: [
        "petugas",
        {
          model: petugas,
          as: "petugas",
          attributes: { exclude: ["password"] },
        },
        "siswa",
        {
          model: siswa,
          as: "siswa",
          attributes: { exclude: ["password"] },
          include: ["kelas", { model: kelas, as: "kelas" }],
        },
        "spp",
        {
          model: spp,
          as: "spp",
        },
      ],
      order: orders,
    })
    .then((pembayaran) => {
      if (pembayaran.length > 0) {
        res.status(200).json({
          status: res.statusCode,
          message: "",
          details: pembayaran,
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

// -- GET TUNGGAKAN
app.get("/tunggakan", async (req, res) => {
  // Fetch data from query params
  const { nisn } = req.query;

  if (nisn) {
    await tunggakan
      .calculateTunggakan(nisn)
      .then((data) => {
        if (data == errorHandling.BAD_REQ) {
          res.status(400).json({
            status: res.statusCode,
            message: "Bad request, please read the documentation",
            details: null,
          });
        } else {
          res.status(200).json({
            status: res.statusCode,
            message: "",
            details: data,
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

app.post("/", accessLimit(["petugas", "admin"]), async (req, res) => {
  if (
    req.body.id_petugas &&
    req.body.nisn &&
    req.body.tgl_bayar &&
    req.body.id_spp &&
    req.body.bulan_spp &&
    req.body.tahun_spp &&
    req.body.jumlah_bayar
  ) {
    let data = ({
      id_petugas,
      nisn,
      tgl_bayar,
      id_spp,
      bulan_spp,
      tahun_spp,
      jumlah_bayar,
    } = req.body);
    await pembayaran
      .create(data)
      .then(async (result) => {
        await pembayaran
          .findOne({
            where: { id_pembayaran: result.id_pembayaran },
            include: [
              "petugas",
              {
                model: petugas,
                as: "petugas",
                attributes: { exclude: ["password"] },
              },
              "siswa",
              {
                model: siswa,
                as: "siswa",
                attributes: { exclude: ["password"] },
                include: ["kelas", { model: kelas, as: "kelas" }],
              },
              "spp",
              {
                model: spp,
                as: "spp",
              },
            ],
          })
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
        "Required body is missing !, Needed body is id_petugas, nisn, tgl_bayar, id_spp, bulan_spp, tahun_spp, jumlah_bayar",
      details: null,
    });
  }
});

app.put("/", accessLimit(["petugas", "admin"]), async (req, res) => {
  if (req.body.id_pembayaran) {
    let data = {};
    for (key in req.body) {
      data[key] = req.body[key];
    }
    await pembayaran
      .update(data, { where: { id_pembayaran: data.id_pembayaran } })
      .then(async (scss) => {
        if (scss[0]) {
          await pembayaran
            .findOne({
              where: { id_pembayaran: data.id_pembayaran },
              include: [
                "petugas",
                {
                  model: petugas,
                  as: "petugas",
                  attributes: { exclude: ["password"] },
                },
                "siswa",
                {
                  model: siswa,
                  as: "siswa",
                  attributes: { exclude: ["password"] },
                  include: ["kelas", { model: kelas, as: "kelas" }],
                },
                "spp",
                {
                  model: spp,
                  as: "spp",
                },
              ],
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
  } else {
    res.status(422).json({
      status: res.statusCode,
      message:
        "Required body is missing !, Needed body is id_pembayaran, and id_petugas or nisn or tgl_bayar or id_spp or bulan_bayar or tahun_bayar or jumlah_bayar",
      details: null,
    });
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
  if (req.query.id_pembayaran) {
    await pembayaran
      .findOne({
        where: { id_pembayaran: req.query.id_pembayaran },
        include: [
          "petugas",
          {
            model: petugas,
            as: "petugas",
            attributes: { exclude: ["password"] },
          },
          "siswa",
          {
            model: siswa,
            as: "siswa",
            attributes: { exclude: ["password"] },
            include: ["kelas", { model: kelas, as: "kelas" }],
          },
          "spp",
          {
            model: spp,
            as: "spp",
          },
        ],
      })
      .then(async (resu) => {
        if (resu) {
          await pembayaran
            .destroy({ where: { id_pembayaran: req.query.id_pembayaran } })
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
      message: "Required params is missing !, Needed params is id_pembayaran",
      details: null,
    });
  }
});

module.exports = app;
