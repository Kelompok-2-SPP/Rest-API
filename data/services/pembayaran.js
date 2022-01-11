const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const pembayaran = models.pembayaran;

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
  // Return with findone
  return await pembayaran
    .findOne({ where: { id_pembayaran: idPembayaran } })
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
}

async function insPembayaran(
  idPetugas,
  nisn,
  tglDibayar,
  bulanDibayar,
  tahunDibayar,
  idSpp,
  jumlahBayar
) {
  const data = {
    id_petugas: idPetugas,
    nisn: nisn,
    tgl_dibayar: tglDibayar,
    bulan_dibayar: bulanDibayar,
    tahun_dibayar: tahunDibayar,
    id_spp: idSpp,
    jumlah_bayar: jumlahBayar,
  };

  return await pembayaran.create(data).catch((error) => {
    throw error;
  });
}

async function putPembayaran(
  idPembayaran,
  idPetugas,
  nisn,
  tglDibayar,
  bulanDibayar,
  tahunDibayar,
  idSpp,
  jumlahBayar
) {
  const data = {
    id_petugas: idPetugas,
    nisn: nisn,
    tgl_dibayar: tglDibayar,
    bulan_dibayar: bulanDibayar,
    tahun_dibayar: tahunDibayar,
    id_spp: idSpp,
    jumlah_bayar: jumlahBayar,
  };

  // Check if data is exists
  return await pembayaran
    .findOne({ where: { id_pembayaran: idPembayaran } })
    .then(async (found) => {
      if (found) {
        // Update pembayaran
        await pembayaran
          .update(data, { where: { id_pembayaran: idPembayaran } })
          .then(async (success) => {
            if (success[0]) {
              return await pembayaran
                .findOne({
                  where: { id_pembayaran: idPembayaran },
                })
                .catch((error) => {
                  throw error;
                });
            } else {
              return errorHandling.FAILED;
            }
          })
          .catch((error) => {
            throw error;
          });
      } else {
        return errorHandling.NOT_FOUND;
      }
    })
    .catch((error) => {
      throw error;
    });
}

async function delPembayaran(idPembayaran) {
  // Get data before it's get deleted
  return await pembayaran
    .findOne({ where: { id_pembayaran: idPembayaran } })
    .then(async (data) => {
      if (data) {
        await pembayaran
          .destroy({ where: { id_pembayaran: idPembayaran } })
          .then((success) => {
            if (success[0]) {
              return data;
            } else {
              return errorHandling.FAILED;
            }
          })
          .catch((error) => {
            throw error;
          });
      } else {
        return errorHandling.NOT_FOUND;
      }
    })
    .catch((error) => {
      throw error;
    });
}

module.exports = {
  getPembayaran,
  getPembayaranbyId,
  insPembayaran,
  putPembayaran,
  delPembayaran,
};
