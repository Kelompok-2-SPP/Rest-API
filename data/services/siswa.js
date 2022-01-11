const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged, passEncrypt } = require("../../domain/utils");

const Op = sequelize.Op;
const siswa = models.siswa;

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
              alamat: { [Op.like]: `%${keyword}%` },
            },
            {
              no_telp: { [Op.like]: `%${keyword}%` },
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
  return await siswa
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      attributes: { exclude: ["password"] },
      order: [["nama", "ASC"]],
    })
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

async function getSiswabyId(nisn) {
  // Return with findone
  return await siswa
    .findOne({ where: { nisn: nisn } })
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

async function insSiswa(nisn, password, nis, nama, idKelas, alamat, noTelp) {
  const data = {
    nisn: nisn,
    password: await passEncrypt(nisn, password),
    nis: nis,
    nama: nama,
    id_kelas: idKelas,
    alamat: alamat,
    no_telp: parseInt(noTelp),
  };

  // Check if has duplicate, becasue nisn is Primary key and also nis is Uniqe key
  return await siswa
    .findOne({
      where: { nisn: data.nisn, nis: data.nis },
    })
    .then(async (duplicate) => {
      // Create new data
      if (!duplicate) {
        return await siswa.create(data).catch((error) => {
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

async function putSiswa(
  nisn,
  newNisn,
  password,
  nis,
  nama,
  idKelas,
  alamat,
  noTelp
) {
  const data = {
    nisn: newNisn,
    password:
      newNisn == null
        ? await passEncrypt(nisn, password)
        : await passEncrypt(newNisn, password),
    nis: nis,
    nama: nama,
    id_kelas: idKelas,
    alamat: alamat,
    no_telp: noTelp,
  };
  // Check if data is exists
  return await siswa
    .findOne({ where: { nisn: nisn } })
    .then(async (found) => {
      if (found) {
        // Check if has duplicate, becasue nisn is Primary key and also nis is Uniqe key
        await siswa
          .findOne({ where: { nisn: data.nisn, nis: data.nis } })
          .then(async (duplicate) => {
            if (!duplicate) {
              // Update siswa
              await siswa
                .update(data, { where: { nisn: nisn } })
                .then(async (succces) => {
                  if (succces[0]) {
                    return await siswa
                      .findOne({ wher: { nis: data.nisn } })
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

async function delSiswa(nisn) {
  // Get data before it's get deleted
  return await siswa
    .findOne({ where: { nisn: nisn } })
    .then(async (data) => {
      if (data) {
        await siswa
          .destroy({ where: { nisn: nisn } })
          .then((success) => {
            if (success[0]) {
              return data;
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
  getSiswa,
  getSiswabyId,
  insSiswa,
  putSiswa,
  delSiswa,
};
