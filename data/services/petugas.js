const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged, passEncrypt } = require("../../domain/utils");

const Op = sequelize.Op;
const petugas = models.petugas;

async function getPetugas(keyword, size, page) {
  // Initiate like opertaor
  const data =
    keyword == null
      ? {}
      : {
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
  return await petugas
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      attributes: { exclude: ["password"] },
      order: [["nama_petugas", "ASC"]],
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

async function getPetugasByUsername(username) {
  // Return with findall
  return await petugas
    .findOne({ where: { username: username } })
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

async function getPetugasbyId(idPetugas) {
  // Return with findone
  return await petugas
    .findOne({ where: { id_petugas: idPetugas } })
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

async function insPetugas(username, namaPetugas, password, level) {
  const data = {
    username: username,
    nama_petugas: namaPetugas,
    password: await passEncrypt(username, password),
    level: level,
  };

  // Check if has duplicate, becasue username is Uniqe key
  return await petugas
    .findOne({
      where: { username: data.username },
    })
    .then(async (duplicate) => {
      // Create new data
      if (!duplicate) {
        await petugas.create(data).catch((error) => {
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

async function putPetugas(idPetugas, username, namaPetugas, password, level) {
  const data = {
    username: username,
    nama_petugas: namaPetugas,
    password: await passEncrypt(username, password),
    level: level,
  };

  // Check if data is exists
  return await petugas
    .findOne({ where: { id_petugas: idPetugas } })
    .then(async (found) => {
      if (found) {
        // Check if has duplicate username, because username is Uniqe key
        await petugas
          .findOne({ where: { username: data.username } })
          .then(async (duplicate) => {
            if (!duplicate) {
              // Update petugas
              await petugas
                .update(data, { where: { id_petugas: idPetugas } })
                .then(async (succces) => {
                  if (succces[0]) {
                    await petugas
                      .findOne({ where: { id_Petugas: idPetugas } })
                      .catch((error) => {
                        throw error;
                      });
                  }
                });
            } else {
              return errorHandling.DOUBLE_DATA;
            }
          });
      } else {
        return errorHandling.NOT_FOUND;
      }
    })
    .catch((error) => {
      throw error;
    });
}

async function delPetugas(idPetugas) {
  // Get data before it's get deleted
  return await petugas
    .findOne({ where: { id_petugas: idPetugas } })
    .then(async (data) => {
      if (data) {
        await petugas
          .destroy({ where: { id_petugas: idPetugas } })
          .then((success) => {
            if (success[0]) {
              return data;
            }
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
  getPetugas,
  getPetugasbyId,
  getPetugasByUsername,
  insPetugas,
  putPetugas,
  delPetugas,
};
