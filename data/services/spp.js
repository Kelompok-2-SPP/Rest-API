const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const spp = models.spp;

async function getSpp(keyword, size, page) {
  // Initiate like opertaor
  const data =
    keyword == undefined
      ? {}
      : {
          [Op.or]: [
            {
              angkatan: { [Op.like]: `%${keyword}%` },
            },
            {
              tahun: { [Op.like]: `%${keyword}%` },
            },
            {
              nominal: { [Op.like]: `%${keyword}%` },
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
  return await spp
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      order: [["tahun", "ASC"]],
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

async function getSppbyId(idSpp) {
  if (!Number.isNaN(Number.parseInt(idSpp))) {
    return await spp
      .findByPk(idSpp)
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

async function insSpp(tahun, nominal, angkatan) {
  if (
    !Number.isNaN(Number.parseInt(tahun)) &&
    !Number.isNaN(Number.parseInt(nominal)) &&
    !Number.isNaN(Number.parseInt(angkatan))
  ) {
    const data = {
      tahun: tahun,
      nominal: nominal,
      angkatan: angkatan,
    };

    return await spp
      .create(data)
      .then((data) => {
        return data;
      })
      .catch((error) => {
        throw error;
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function putSpp(idSpp, body) {
  if (!Number.isNaN(Number.parseInt(idSpp))) {
    let data = {};

    const regex = new RegExp("tahun|nominal|angkatan");

    for (key in body) {
      if (regex.test(key) && Number.isNaN(Number.parseInt(body[key]))) {
        return errorHandling.BAD_REQ;
      }
      data[key] = body[key];
    }

    return await spp
      .update(data, { where: { id_spp: idSpp } })
      .then(async () => {
        return await spp
          .findByPk(idSpp)
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
        throw err;
      });
  } else {
    return errorHandling.BAD_REQ;
  }
}

async function delSpp(idSpp) {
  if (!Number.isNaN(Number.parseInt(idSpp))) {
    return await spp
      .findByPk(idSpp)
      .then(async (data) => {
        if (data) {
          await spp.destroy({ where: { id_spp: idSpp } }).catch((err) => {
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
  getSpp,
  getSppbyId,
  insSpp,
  putSpp,
  delSpp,
};
