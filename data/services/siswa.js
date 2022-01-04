const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged, passEncrypt } = require("../../domain/utils");

const Op = sequelize.Op;
const siswa = models.siswa;

async function getSiswa(keyword, size, page) {
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

  // Return with findandcountall
  await siswa
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      attributes: { exclude: ["password"] },
      order: [["nama", "ASC"]],
    })
    .then((lng) => {
      if (lng.count > 0) {
        return new Paged(
          (content = lng.rows),
          (totalPages = Math.ceil(lng.count / size))
        );
      } else {
        return errorHandling.NOT_FOUND;
      }
    });
}

async function getAllSiswaById(username) {
    // Return with findall
    await petugas.findAll({ where: { username: username } }).then((data) => {
      if (data.length > 0) {
        return data;
      } else {
        return errorHandling.NOT_FOUND;
      }
    });
  }

async function getSiswabyId(nisn) {
  // Return with findone
  await siswa.findOne({ where: { nisn: nisn } }).then((lng) => {
    if (lng.length > 0) {
      return lng;
    } else {
      return errorHandling.NOT_FOUND;
    }
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
    no_telp: noTelp,
  };

  // Check if has duplicate, becasue nisn is Primary key and also nis is Uniqe key
  await siswa
    .findOne({
      where: { nisn: data.nisn, nis: data.nis },
    })
    .then((duplicate) => {
      // Create new data
      if (!duplicate) {
        return siswa.create(data);
      } else {
        return errorHandling.DOUBLE_DATA;
      }
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
    password: await passEncrypt(nisn, password),
    nis: nis,
    nama: nama,
    id_kelas: idKelas,
    alamat: alamat,
    no_telp: noTelp,
  };
  // Check if data is exists
  await siswa.findOne({ where: { nisn: nisn } }).then((found) => {
    if (found) {
      // Check if has duplicate, becasue nisn is Primary key and also nis is Uniqe key
      siswa.findOne({ where: { nisn: data.nisn, nis: data.nis } }).then((duplicate) => {
        if (!duplicate) {
          // Update siswa
          siswa.update(data, { where: { nisn: nisn } }).then(() => {
            return siswa.findOne({ where: { nisn: data.nisn } });
          });
        } else {
          return errorHandling.DOUBLE_DATA;
        }
      });
    } else {
      return errorHandling.NOT_FOUND;
    }
  });
}

async function delSiswa(nisn) {
  // Get data before it's get deleted
  await siswa.findOne({ where: { nisn: nisn } }).then((data) => {
    if (data) {
      siswa.destroy({ where: { nisn: nisn } }).then(() => {
        return data;
      });
    } else {
      return errorHandling.NOT_FOUND;
    }
  });
}

module.exports = {
  getSiswa,
  getSiswabyId,
  getAllSiswaById,
  insSiswa,
  putSiswa,
  delSiswa,
};
