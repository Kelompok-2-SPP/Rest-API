const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const pembayaran = models.pembayaran;

async function getPembayaran(keyword, size, page) {
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
  // Initiate like opertaor
  const data = {
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

  // Return with findandcountall
  const lng = await pembayaran.findAndCountAll({
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
  });
  if (lng.count > 0) {
    return new Paged(
      (content = lng.rows),
      (totalPages = Math.ceil(lng.count / size))
    );
  } else {
    return errorHandling.NOT_FOUND;
  }
}

async function getPembayaranbyId(idPembayaran) {
  // Return with findone
  const lng = await pembayaran.findOne({
    where: { id_pembayaran: idPembayaran },
  });
  if (lng) {
    return lng;
  } else {
    return errorHandling.NOT_FOUND;
  }
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

  return await pembayaran.create(data);
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
  const found = await pembayaran.findOne({
    where: { id_pembayaran: idPembayaran },
  });
  if (found) {
    // Update pembayaran
    const update = await pembayaran.update(data, { where: { id_pembayaran: idPembayaran } })
        return pembayaran.findOne({
          where: { id_pembayaran: idPembayaran },
        });
  } else {
    return errorHandling.NOT_FOUND;
  }
}

async function delPembayaran(idPembayaran) {
  // Get data before it's get deleted
  await pembayaran
    .findOne({ where: { id_pembayaran: idPembayaran } })
    .then((data) => {
      if (data) {
        pembayaran
          .destroy({ where: { id_pembayaran: idPembayaran } })
          .then(() => {
            return data;
          });
      } else {
        return errorHandling.NOT_FOUND;
      }
    });
}

module.exports = {
  getPembayaran,
  getPembayaranbyId,
  insPembayaran,
  putPembayaran,
  delPembayaran,
};
