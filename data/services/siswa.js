const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling, paginationNumber } = require("../../domain/const");
const { Paged, passEncrypt } = require("../../domain/utils");

const Op = sequelize.Op;
const siswa = models.siswa;
const kelas = models.kelas;

const baseOptions = {
  attributes: { exclude: ["password", "id_kelas"] },
  include: ["kelas", { model: kelas, as: "kelas" }],
};

async function getSiswa(keyword, size, page) {
  // Initiate like opertaor
  const data =
    keyword == null
      ? {}
      : {
          [Op.or]: [
            {
              nisn: { [Op.like]: `%${keyword}%` },
            },
            {
              nis: { [Op.like]: `%${keyword}%` },
            },
            {
              nama: { [Op.like]: `%${keyword}%` },
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
  if (!Number.isNaN(sizeAsNum) && sizeAsNum > 0 && sizeAsNum < paginationNumber) {
    sized = sizeAsNum;
  }

  // Return with findandcountall
  return await siswa
    .findAndCountAll(
      {
        limit: sized,
        offset: paged * sized,
        where: data,
        order: [["nama", "ASC"]],
      } + baseOptions
    )
    .then(async (data) => {
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

async function getSiswabyIdAuth(nisn) {
  if (nisn) {
    return await siswa
      .findByPk(nisn)
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

async function getSiswabyId(nisn) {
  if (nisn) {
    return await siswa
      .findByPk(nisn, baseOptions)
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

async function insSiswa(nisn, password, nis, nama, idKelas, alamat, noTelp) {
  if (
    (nisn &&
      password &&
      nis &&
      nama &&
      !Number.isNaN(Number.parseInt(idKelas)) &&
      alamat,
    !Number.isNaN(Number.parseInt(noTelp)))
  ) {
    const data = {
      nisn: nisn,
      password: await passEncrypt("siswa", password),
      nis: nis,
      nama: nama,
      id_kelas: idKelas,
      alamat: alamat,
      no_telp: noTelp,
    };

    return await siswa
      .create(data)
      .then(async (data) => {
        return await siswa
          .findByPk(data.nisn, baseOptions)
          .then((datas) => {
            return datas;
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          return errorHandling.DOUBLE_DATA;
        } else if (err.name == "SequelizeForeignKeyConstraintError") {
          return errorHandling.INDEX_NOT_FOUND;
        } else {
          throw err;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function putSiswa(nisn, body) {
  if (nisn) {
    let data = {};

    const regex = new RegExp("id_kelas|no_telp");

    for (key in body) {
      if (regex.test(key) && Number.isNaN(Number.parseInt(body[key]))) {
        return errorHandling.BAD_REQ;
      }
      if (key == "password") {
        data[key] = await passEncrypt("siswa", body[key]);
        continue;
      }
      data[key] = body[key];
    }

    return await siswa
      .update(data, { where: { nisn: nisn } })
      .then(async () => {
        return await siswa
          .findByPk(data.nisn ? data.nisn : nisn, baseOptions)
          .then((find) => {
            if (find) {
              return find;
            } else {
              return errorHandling.NOT_FOUND;
            }
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          return errorHandling.DOUBLE_DATA;
        } else if (err.name == "SequelizeForeignKeyConstraintError") {
          return errorHandling.INDEX_NOT_FOUND;
        } else {
          throw err;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function delSiswa(nisn) {
  if (nisn) {
    return await siswa
      .findByPk(nisn, baseOptions)
      .then(async (data) => {
        if (data) {
          await siswa.destroy({ where: { nisn: nisn } }).catch((err) => {
            throw err;
          });
          return data;
        } else {
          return errorHandling.NOT_FOUND;
        }
      })
      .catch((err) => {
        throw err;
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

module.exports = {
  getSiswa,
  getSiswabyIdAuth,
  getSiswabyId,
  insSiswa,
  putSiswa,
  delSiswa,
};
