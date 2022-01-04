const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged, passEncrypt } = require("../../domain/utils");

const Op = sequelize.Op;
const petugas = models.petugas;

async function getPetugas(keyword, size, page) {
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
        username: { [Op.like]: `%${keyword}%` },
      },
      {
        nama_petugas: { [Op.like]: `%${keyword}%` },
      },
      {
        level: { [Op.like]: `%${keyword}%` },
      },
    ],
  };

  // Return with findandcountall
  await petugas
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      attributes: { exclude: ["password"] },
      order: [["nama_petugas", "ASC"]],
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

async function getAllPetugasByUsername(username) {
  // Return with findall
  return await petugas.findAll({ where: { username: username } }).then((data) => {
    if (data) {
      resolve(data);
    } else {
      resolve(errorHandling.NOT_FOUND);
    }
  });
}

async function getPetugasbyId(idPetugas) {
  // Return with findone
  await petugas.findOne({ where: { id_petugas: idPetugas } }).then((lng) => {
    if (lng.count > 0) {
      return lng;
    } else {
      return errorHandling.NOT_FOUND;
    }
  });
}

async function insPetugas(username, namaPetugas, password, level) {
  const data = {
    username: username,
    nama_petugas: namaPetugas,
    password: await passEncrypt(username, password),
    level: level,
  };

  // Check if has duplicate, becasue username is Uniqe key
  await petugas
    .findOne({
      where: { username: data.username },
    })
    .then((duplicate) => {
      // Create new data
      if (!duplicate) {
        return petugas.create(data);
      } else {
        return errorHandling.DOUBLE_DATA;
      }
    });
}

async function putPetugas(idPetugas, username, namaPetugas, password, level) {
  const data = {
    username: username,
    nama_petugas: namaPetugas,
    password: await passEncrypt(username, password),
    level: level,
  };

  // Check if data is exists
  await petugas.findOne({ where: { id_petugas: idPetugas } }).then((found) => {
    if (found) {
      // Check if has duplicate username, because username is Uniqe key
      petugas
        .findOne({ where: { username: data.username } })
        .then((duplicate) => {
          if (!duplicate) {
            // Update petugas
            petugas
              .update(data, { where: { id_petugas: idPetugas } })
              .then(() => {
                return kelas.findOne({ where: { id_petugas: idPetugas } });
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

async function delPetugas(idPetugas) {
  // Get data before it's get deleted
  await petugas.findOne({ where: { id_petugas: idPetugas } }).then((data) => {
    if (data) {
      petugas.destroy({ where: { id_petugas: idPetugas } }).then(() => {
        return data;
      });
    } else {
      return errorHandling.NOT_FOUND;
    }
  });
}

module.exports = {
  getPetugas,
  getPetugasbyId,
  getAllPetugasByUsername,
  insPetugas,
  putPetugas,
  delPetugas,
};
