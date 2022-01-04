const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const kelas = models.kelas;

async function getKelas(keyword, size, page) {
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

  // Return with findandcountall
  const promise = await new Promise((resolve, reject) => {
    kelas
      .findAndCountAll({
        limit: sized,
        offset: paged * sized,
        where: data,
        order: [["nama_kelas", "ASC"]],
      })
      .then((lng) => {
        if (lng.count > 0) {
          resolve(
            new Paged(
              (content = lng.rows),
              (totalPages = Math.ceil(lng.count / size))
            )
          );
        } else {
          resolve(errorHandling.NOT_FOUND);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
  return promise;
}

async function getKelasbyId(idKelas) {
  // Return with findone
  const promise = await new Promise((resolve, reject) => {
    kelas
      .findOne({ where: { id_kelas: idKelas } })
      .then((lng) => {
        if (lng) {
          resolve(lng);
        } else {
          resolve(errorHandling.NOT_FOUND);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });

  return promise;
}

async function insKelas(namaKelas, jurusan, angkatan) {
  const data = {
    nama_kelas: namaKelas,
    jurusan: jurusan,
    angkatan: angkatan,
  };

  // Check if has duplicate, becasue nama_kelas is Uniqe key
  const promise = await new Promise(resolve, (reject) => {
    kelas
      .findOne({
        where: { nama_kelas: data.nama_kelas },
      })
      .then((duplicate) => {
        // Create new data
        if (!duplicate) {
          resolve(kelas.create(data))
        } else {
          return errorHandling.DOUBLE_DATA;
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
  return promise;
}

async function putKelas(idKelas, namaKelas, jurusan, angkatan) {
  const data = {
    nama_kelas: namaKelas,
    jurusan: jurusan,
    angkatan: angkatan,
  };
  // Check if data is exists
  const promise = await new Promise(resolve, reject => {
    kelas.findOne({ where: { id_kelas: idKelas } }).then((found) => {
      if (found) {
        // Check if has duplicate nama_kelas, because nama_kelas is Uniqe key
        kelas
          .findOne({ where: { nama_kelas: data.nama_kelas } })
          .then((duplicate) => {
            if (!duplicate) {
              // Update kelas
              kelas.update(data, { where: { id_kelas: idKelas } }).then(() => {
                return kelas.findOne({ where: { id_kelas: idKelas } });
              });
            } else {
              return errorHandling.DOUBLE_DATA;
            }
          });
      } else {
        return errorHandling.NOT_FOUND;
      }
    }).catch(error => {
      reject(error)
    })
  })
}

async function delKelas(idKelas) {
  // Get data before it's get deleted
  await kelas.findOne({ where: { id_kelas: idKelas } }).then((data) => {
    if (data) {
      kelas.destroy({ where: { id_kelas: idKelas } }).then(() => {
        return data;
      });
    } else {
      return errorHandling.NOT_FOUND;
    }
  });
}

module.exports = {
  getKelas,
  getKelasbyId,
  insKelas,
  putKelas,
  delKelas,
};
