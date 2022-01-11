const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const kelas = models.kelas;

async function getKelas(keyword, size, page) {
  // Initiate like opertaor
  const data =
    keyword == null
      ? {}
      : {
          [Op.or]: [
            {
              nama_kelas: { [Op.like]: `%${keyword}%` },
            },
            {
              jurusan: { [Op.like]: `%${keyword}%` },
            },
            {
              angkatan: { [Op.like]: `%${keyword}%` },
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
  return await kelas
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      order: [["nama_kelas", "ASC"]],
    })
    .then((data) => {
      if (data.count > 0) {
        return new Paged(data.count, data.rows, Math.ceil(data.count / size));
      } else {
        return errorHandling.NOT_FOUND;
      }
    })
    .catch((error) => {
      throw error;
    });
}

async function getKelasbyId(idKelas) {
  // Return with findone
  return await kelas
    .findOne({ where: { id_kelas: idKelas } })
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

async function insKelas(namaKelas, jurusan, angkatan) {
  const data = {
    nama_kelas: namaKelas,
    jurusan: jurusan,
    angkatan: angkatan,
  };

  // Check if has duplicate, becasue nama_kelas is Uniqe key
  return await kelas
    .findOne({
      where: { nama_kelas: data.nama_kelas },
    })
    .then(async (duplicate) => {
      // Create new data
      if (!duplicate) {
        return await kelas.create(data).catch((error) => {
          throw error;
        });
      } else {
        return errorHandling.DOUBLE_DATA;
      }
    })
    .catch((error) => {
      throw error;
    });
}

async function putKelas(idKelas, data) {
  const data = {
    nama_kelas: namaKelas,
    jurusan: jurusan,
    angkatan: angkatan,
  };
  // Check if data is exists
  return await kelas
    .findOne({ where: { id_kelas: idKelas } })
    .then(async (found) => {
      if (found) {
        // Check if has duplicate nama_kelas, because nama_kelas is Uniqe key
        await kelas
          .findOne({ where: { nama_kelas: data.nama_kelas } })
          .then(async (duplicate) => {
            if (!duplicate) {
              // Update kelas
              await kelas
                .update(data, { where: { id_kelas: idKelas } })
                .then(async (success) => {
                  // Return class data
                  if (success[0]) {
                    return await kelas
                      .findOne({ where: { id_kelas: idKelas } })
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
              return errorHandling.DOUBLE_DATA;
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

async function delKelas(idKelas) {
  // Get data before it's get deleted
  return await kelas
    .findOne({ where: { id_kelas: idKelas } })
    .then(async (data) => {
      if (data) {
        await kelas
          .destroy({ where: { id_kelas: idKelas } })
          .then((check) => {
            if (check[0]) {
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
  getKelas,
  getKelasbyId,
  insKelas,
  putKelas,
  delKelas,
};
