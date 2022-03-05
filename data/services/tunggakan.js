const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { passedMonth, Tunggakan } = require("../../domain/utils");
const { getLatestSpp } = require("./spp");

const Op = sequelize.Op;

const pembayaran = models.pembayaran;
const spp = models.spp;

async function getTunggakanFromPembayaran(nisn) {
  return await pembayaran
    .findAll({
      where: {
        nisn: nisn,
        jumlah_bayar: {
          [Op.or]: [
            { [Op.lt]: { [Op.col]: "spp.nominal" } },
            { [Op.is]: null },
          ],
        },
      },
      attributes: { exclude: ["id_petugas", "nisn", "id_spp"] },
      include: ["spp", { model: spp, as: "spp" }],
      order: [
        ["tahun_spp", "DESC"],
        ["bulan_spp", "DESC"],
      ],
    })
    .then((data) => {
      if (data) {
        return data;
      } else {
        return errorHandling.NOT_FOUND;
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function getLatestTunggakanFromPembayaran(nisn) {
  return await pembayaran
    .findOne({
      where: {
        nisn: nisn,
        jumlah_bayar: {
          [Op.or]: [
            { [Op.lt]: { [Op.col]: "spp.nominal" } },
            { [Op.is]: null },
          ],
        },
      },
      attributes: { exclude: ["id_petugas", "nisn", "id_spp"] },
      include: ["spp", { model: spp, as: "spp" }],
      order: [
        ["tahun_spp", "DESC"],
        ["bulan_spp", "DESC"],
      ],
    })
    .then((data) => {
      if (data) {
        return data;
      } else {
        return errorHandling.NOT_FOUND;
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function addTunggakan(nisn, month, year) {
  await getLatestSpp(nisn, year)
    .then(async (idSpp) => {
      if (idSpp == errorHandling.NOT_FOUND) {
        return errorHandling.NOT_FOUND;
      } else {
        await pembayaran
          .count({ where: { bulan_spp: month, tahun_spp: year } })
          .then(async (count) => {
            if (count == 0) {
              await pembayaran
                .create({
                  nisn: nisn,
                  id_spp: idSpp.id_spp,
                  bulan_spp: month,
                  tahun_spp: year,
                })
                .catch((err) => {
                  throw err;
                });
            }
          });
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function calculateTunggakan(nisn) {
  if (nisn) {
    return await getLatestTunggakanFromPembayaran(nisn).then(
      async (tunggakan) => {
        if (tunggakan == errorHandling.NOT_FOUND) {
          return new Tunggakan(nisn, 0, 0, null);
        } else {
          // If month difference is bigger than one
          passed = passedMonth(tunggakan.bulan_spp + "/" + tunggakan.tahun_spp);
          if (passed >= 1) {
            let year = tunggakan.tahun_spp;
            let month = tunggakan.bulan_spp;

            for (let i = 0; i < passed; i++) {
              if (month == 12) {
                (month = 0), (month += 1), (year += 1);
              } else {
                month += 1;
              }

              await addTunggakan(nisn, month, year);
            }
          }

          return await getTunggakanFromPembayaran(nisn)
            .then((a) => {
              if (a == errorHandling.NOT_FOUND) {
                return new Tunggakan(nisn, 0, 0, null);
              } else {
                let totalTunggakan = 0;

                for (b of a) {
                  totalTunggakan += b.spp.nominal - b.jumlah_bayar;
                }
                return new Tunggakan(nisn, a.length, totalTunggakan, a);
              }
            })
            .catch((err) => {
              throw err;
            });
        }
      }
    );
  } else {
    return errorHandling.BAD_REQ;
  }
}

module.exports = {
  calculateTunggakan,
};
