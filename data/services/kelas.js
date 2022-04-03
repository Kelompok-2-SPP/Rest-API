const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling, paginationNumber } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const kelas = models.kelas;

// Kelas get kelas all
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

  let sized = paginationNumber;
  if (
    !Number.isNaN(sizeAsNum) &&
    sizeAsNum > 0 &&
    sizeAsNum < paginationNumber
  ) {
    sized = sizeAsNum;
  }

  // Return with findandcountall
  return await kelas
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      order: [["angkatan", "ASC"]],
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

// Kelas get kelas by id
async function getKelasbyId(idKelas) {
  if (!Number.isNaN(Number.parseInt(idKelas))) {
    // Return with findone
    return await kelas
      .findByPk(idKelas)
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

// Kelas insert new data
async function insKelas(namaKelas, jurusan, angkatan) {
  if (namaKelas && jurusan && !Number.isNaN(Number.parseInt(angkatan))) {
    const data = {
      nama_kelas: namaKelas,
      jurusan: jurusan,
      angkatan: angkatan,
    };
    return await kelas
      .create(data)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          return errorHandling.DOUBLE_DATA;
        } else {
          throw err;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

// Kelas put data
async function putKelas(idKelas, body) {
  if (!Number.isNaN(Number.parseInt(idKelas))) {
    // Init null var
    let data = {};

    // Literate body to data
    for (key in body) {
      if (key == "angkatan" && Number.isNaN(Number.parseInt(body[key]))) {
        return errorHandling.BAD_REQ;
      }
      data[key] = body[key];
    }

    // Begin update sequence
    return await kelas
      .update(data, { where: { id_kelas: idKelas } })
      .then(async () => {
        return await kelas
          .findByPk(idKelas)
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
        if (err.name == "SequelizeUniqueConstraintError") {
          return errorHandling.DOUBLE_DATA;
        } else {
          throw err;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

// Kelas destroy
async function delKelas(idKelas) {
  if (!Number.isNaN(Number.parseInt(idKelas))) {
    // Get data before it's get deleted
    return await kelas
      .findByPk(idKelas)
      .then(async (data) => {
        if (data) {
          await kelas
            .destroy({ where: { id_kelas: idKelas } })
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
  getKelas,
  getKelasbyId,
  insKelas,
  putKelas,
  delKelas,
};
