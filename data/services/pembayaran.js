const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged, verifyDate, formatDate } = require("../../domain/utils");

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
              tgl_bayar: { [Op.like]: `%${keyword}%` },
            },
            {
              bulan_spp: { [Op.like]: `%${keyword}%` },
            },
            {
              tahun_spp: { [Op.like]: `%${keyword}%` },
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
      order: [["updatedAt", "DESC"]],
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

async function insPembayaran(
  idPetugas,
  nisn,
  tglBayar,
  idSpp,
  bulanSpp,
  tahunSpp,
  jumlahBayar
) {
  if (
    !Number.isNaN(Number.parseInt(idPetugas)) &&
    nisn &&
    verifyDate(tglDibayar).fullDate &&
    verifyMonth(bulanDibayar).month &&
    verifyYear(tahunDibayar).year &&
    !Number.isNaN(Number.parseInt(idSpp)) &&
    !Number.isNaN(Number.parseInt(jumlahBayar))
  ) {
    const data = {
      id_petugas: idPetugas,
      nisn: nisn,
      tgl_bayar: formatDate(tglBayar).string,
      id_spp: idSpp,
      bulan_spp: bulanSpp,
      tahun_spp: tahunSpp,
      jumlah_bayar: jumlahBayar,
    };

    return await pembayaran
      .create(data)
      .then(async (data) => {
        return await pembayaran
          .findByPk(data.id_pembayaran, {
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
          .then((datas) => {
            return datas;
          })
          .catch((err) => {
            throw err;
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

async function putPembayaran(idPembayaran, body) {
  if (!Number.isNaN(Number.parseInt(idPembayaran))) {
    let data = {};

    const regex = new RegExp("id_petugas|id_spp|jumlah_bayar");

    for (key in body) {
      if (
        (regex.test(key) && Number.isNaN(body[key])) ||
        (key == "tgl_bayar" && !verifyDate(body[key])).date ||
        (key == "bulan_spp" && !verifyMonth(body[key])).month ||
        (key == "tahun_spp" && !verifyYear(body[key])).year
      ) {
        return errorHandling.BAD_REQ;
      }

      if (key == "tgl_bayar" && verifyDate(body[key])) {
        data[key] = formatDate(body[key]).string;
        continue;
      }
      data[key] = body[key];
    }
    return await pembayaran
      .update(data, { where: { id_pembayaran: idPembayaran } })
      .then(async () => {
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
