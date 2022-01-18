const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged, passEncrypt } = require("../../domain/utils");

const Op = sequelize.Op;
const petugas = models.petugas;

const regex = new RegExp("petugas|admin");

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
  if (username) {
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
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function getPetugasbyId(idPetugas) {
  if (!Number.isNaN(Number.parseInt(idPetugas))) {
    return await petugas
      .findByPk(idPetugas, { attributes: { exclude: ["password"] } })
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
  // Return with findone
}

async function insPetugas(username, namaPetugas, password, level) {
  if ((username, namaPetugas, password)) {
    const data = {
      username: username,
      nama_petugas: namaPetugas,
      password: await passEncrypt("petugas", password),
      level: level,
    };

    return await petugas
      .create(data)
      .then((data) => {
        delete data.dataValues.password;
        return data;
      })
      .catch((error) => {
        if (error.name == "SequelizeUniqueConstraintError") {
          return errorHandling.DOUBLE_DATA;
        } else {
          throw error;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function putPetugas(idPetugas, body) {
  if (!Number.isNaN(Number.parseInt(idPetugas))) {
    let data = {};

    for (key in body) {
      if (key == "level" && regex.test(body[key])) {
        return errorHandling.BAD_REQ;
      }

      if (key == "password") {
        data[key] = await passEncrypt("petugas", body[key]);
      } else {
        data[key] = body[key];
      }
    }

    return await petugas
      .update(data, { where: { id_petugas: idPetugas } })
      .then(async () => {
        return await petugas
          .findByPk(idPetugas, { attributes: { exclude: ["password"] } })
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
        } else {
          throw err;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function delPetugas(idPetugas) {
  if (!Number.isNaN(Number.parseInt(idPetugas))) {
    return await petugas
      .findByPk(idPetugas, { attributes: { exclude: ["password"] } })
      .then(async (data) => {
        if (data) {
          await petugas
            .destroy({ where: { id_petugas: idPetugas } })
            .catch((err) => {
              throw err;
            });
          return data;
        } else {
          return errorHandling.NOT_FOUND;
        }
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

module.exports = {
  getPetugas,
  getPetugasbyId,
  getPetugasByUsername,
  insPetugas,
  putPetugas,
  delPetugas,
};
