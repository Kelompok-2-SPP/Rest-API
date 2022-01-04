const express = require("express");
const sequelize = require("sequelize");
const models = require("../../data/models/index");
const { auth_verify, access_roles } = require("./verify");
const app = express();

const Op = sequelize.Op;
const pembayaran = models.pembayaran;
const siswa = models.siswa;
const petugas = models.petugas;
const spp = models.spp;

app.use(auth_verify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let data = {};

  if (req.query.keyword) {
    data = {
      [Op.or]: [
        {
          tgl_dibayar: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          bulan_dibayar: { [Op.like]: `%${req.query.keyword}%` },
        },
        {
          tahun_dibayar: { [Op.like]: `%${req.query.keyword}%` },
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
        },
        "spp",
        {
          model: spp,
          as: "spp",
        },
      ],
      order: [["createdAt", "ASC"]],
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
          details: pembayaran,
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

app.post("/", access_roles(["petugas", "admin"]), async (req, res) => {
  if (
    req.body.id_petugas &&
    req.body.nisn &&
    req.body.tgl_dibayar &&
    req.body.bulan_dibayar &&
    req.body.tahun_dibayar &&
    req.body.id_spp &&
    req.body.jumlah_bayar
  ) {
    let data = ({
      id_petugas,
      nisn,
      tgl_dibayar,
      bulan_dibayar,
      tahun_dibayar,
      id_spp,
      jumlah_bayar,
    } = req.body);
    await pembayaran
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
      details:
        "Needed body is id_petugas, nisn, tgl_dibayar, bulan_dibayar, tahun_dibayar, id_spp, jumlah_bayar",
    });
  }
});

app.put("/", access_roles(["petugas", "admin"]), async (req, res) => {
  if (req.body.id_pembayaran) {
    let data = {};
    for (key in req.body) {
      data[key] = req.body[key];
    }
    await pembayaran
      .update(data, { where: { id_pembayaran: data.id_pembayaran } })
      .then((scss) => {
        if (scss[0]) {
          pembayaran
            .findOne({ where: { id_pembayaran: data.id_pembayaran } })
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
        "Needed body is id_pembayaran, and id_petugas or nisn or tgl_dibayar or bulan_dibayar or tahun_dibayar or id_spp or jumlah_bayar",
    });
  }
});

app.delete("/", access_roles(["admin"]), async (req, res) => {
  if (req.query.id_pembayaran) {
    await pembayaran
      .findOne({ where: { id_pembayaran: req.query.id_pembayaran } })
      .then((resu) => {
        if (resu) {
          pembayaran
            .destroy({ where: { id_pembayaran: req.query.id_pembayaran } })
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
      details: "Needed params is id_pembayaran",
    });
  }
});

module.exports = app;
