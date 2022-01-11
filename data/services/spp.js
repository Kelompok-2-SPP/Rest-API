const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const spp = models.spp;

async function getSpp(keyword, size, page) {
  // Initiate like opertaor
  const data = keyword == undefined ? {}:{
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
  // Return with findone
  return await spp
    .findOne({ where: { id_spp: idSpp } })
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

async function insSpp(tahun, nominal, angkatan) {
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
}

async function putSpp(idSpp, tahun, nominal, angkatan) {
  const data = {
    tahun: tahun,
    nominal: nominal,
    angkatan: angkatan,
  };

  // Check if data is exists
  return await spp
    .findOne({ where: { id_spp: idSpp } })
    .then(async (found) => {
      if (found) {
        // Update spp
        await spp
          .update(data, { where: { id_spp: idSpp } })
          .then(async (success) => {
            if (success[0]) {
              return await spp.findOne({ where: { id_spp: idSpp } });
            }
          })
          .catch((error) => {
            throw error;
          });
      } else {
        resolve(errorHandling.NOT_FOUND);
      }
    })
    .catch((error) => {
      throw error;
    });
}

async function delSpp(idSpp) {
  // Get data before it's get deleted
  return await spp
    .findOne({ where: { id_spp: idSpp } })
    .then(async (data) => {
      if (data) {
        await spp
          .destroy({ where: { id_spp: idSpp } })
          .then((succces) => {
            if (succces[0]) {
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
  getSpp,
  getSppbyId,
  insSpp,
  putSpp,
  delSpp,
};
