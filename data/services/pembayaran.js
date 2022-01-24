const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged, verifyDate, parseDate } = require("../../domain/utils");

const Op = sequelize.Op;

const pembayaran = models.pembayaran;
const petugas = models.petugas;
const siswa = models.siswa;
const spp = models.spp;
const kelas = models.kelas;

async function getPembayaran(keyword, size, page) {
  // Initiate like opertaor
  const data =
    keyword == null
      ? {}
      : {
          [Op.or]: [
            {
              tgl_dibayar: { [Op.like]: `%${keyword}%` },
            },
            {
              bulan_dibayar: { [Op.like]: `%${keyword}%` },
            },
            {
              tahun_dibayar: { [Op.like]: `%${keyword}%` },
            },
            {
              jumlah_bayar: { [Op.like]: `%${keyword}%` },
            },
            {
              updatedAt: { [Op.like]: `%${keyword}%` },
            },
            {
              createdAt: { [Op.like]: `%${keyword}%` },
            },
          ],
        };

  // Check if number or not
  sizeAsNum = Number.parseInt(size);
  pageAsNum = Number.parseInt(page);

  let paged = 0;
  if (!Number.isNaN(pageAsNum) && pageAsNum > 0) {
    paged = pageAsNum;
  }

  let sized = 10;
  if (!Number.isNaN(sizeAsNum) && sizeAsNum > 0 && sizeAsNum < 10) {
    sized = sizeAsNum;
  }

  // Return with findandcountall
  return await pembayaran
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      attributes: { exclude: ["id_petugas", "nisn", "id_spp"] },
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
          attributes: { exclude: ["password", "id_kelas"] },
          include: ["kelas", { model: kelas, as: "kelas" }],
        },
        "spp",
        {
          model: spp,
          as: "spp",
        },
      ],
      order: [["updatedAt", "ASC"]],
    })
    .then((data) => {
      if (data.count > 0) {
        return new Paged(
          (count = data.count),
          (content = data.rows),
          (totalPages = Math.ceil(data.count / size))
        );
      } else {
        return errorHandling.NOT_FOUND;
      }
    })
    .catch((error) => {
      throw error;
    });
}

async function getPembayaranbyId(idPembayaran) {
  if (!Number.isNaN(Number.parseInt(idPembayaran))) {
    // Return with findone
    return await pembayaran
      .findByPk(idPembayaran, {
        attributes: { exclude: ["id_petugas", "nisn", "id_spp"] },
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
            attributes: { exclude: ["password", "id_kelas"] },
            include: ["kelas", { model: kelas, as: "kelas" }],
          },
          "spp",
          {
            model: spp,
            as: "spp",
          },
        ],
      })
      .then((data) => {
        if (data) {
          return data;
        } else {
          return errorHandling.NOT_FOUND;
        }
      })
      .catch((error) => {
        throw error;
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function insPembayaran(idPetugas, nisn, tglDibayar, idSpp, jumlahBayar) {
  if (
    !Number.isNaN(Number.parseInt(idPetugas)) &&
    nisn &&
    verifyDate(tglDibayar) &&
    !Number.isNaN(Number.parseInt(idSpp)) &&
    !Number.isNaN(Number.parseInt(jumlahBayar))
  ) {
    const date = parseDate(tglDibayar);
    const data = {
      id_petugas: idPetugas,
      nisn: nisn,
      tgl_dibayar: date.date,
      bulan_dibayar: date.month,
      tahun_dibayar: date.year,
      id_spp: idSpp,
      jumlah_bayar: jumlahBayar,
    };

    return await pembayaran
      .create(data)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        if (err.name == "SequelizeForeignKeyConstraintError") {
          return errorHandling.INDEX_NOT_FOUND;
        } else {
          throw err;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function putPembayaran(idPembayaran, body) {
  if (!Number.isNaN(Number.parseInt(idPembayaran))) {
    let data = {};

    const regex = new RegExp("id_petugas|id_spp|jumlah_bayar");

    for (key in body) {
      if (regex.test(key) && Number.isNaN(body[key])) {
        return errorHandling.BAD_REQ;
      }
      if (key == "tgl_dibayar" && !verifyDate(body[key])) {
        return errorHandling.BAD_REQ;
      } else if (key == "tgl_dibayar" && verifyDate(body[key])) {
        const date = parseDate(body[key]);
        data[key] = date.date;
        data["bulan_dibayar"] = date.month;
        data["tahun_dibayar"] = date.year;
        continue;
      }
      data[key] = body[key];
    }
    return await pembayaran
      .update(data, { where: { id_pembayaran: idPembayaran } })
      .then(async () => {
        return await pembayaran
          .findByPk(idPembayaran)
          .then((find) => {
            if (find) {
              return find;
            } else {
              return errorHandling.NOT_FOUND;
            }
          })
          .catch((error) => {
            throw error;
          });
      })
      .catch((err) => {
        if (err.name == "SequelizeForeignKeyConstraintError") {
          return errorHandling.INDEX_NOT_FOUND;
        } else {
          throw err;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function delPembayaran(idPembayaran) {
  if (!Number.isNaN(idPembayaran)) {
    return await pembayaran
      .findByPk(idPembayaran)
      .then(async (data) => {
        if (data) {
          await pembayaran
            .destroy({ where: { id_pembayaran: idPembayaran } })
            .catch((error) => {
              throw error;
            });
          return data;
        } else {
          return errorHandling.NOT_FOUND;
        }
      })
      .catch((error) => {
        throw error;
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

module.exports = {
  getPembayaran,
  getPembayaranbyId,
  insPembayaran,
  putPembayaran,
  delPembayaran,
};
