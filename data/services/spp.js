const sequelize = require("sequelize");
const models = require("../models");
const { errorHandling } = require("../../domain/const");
const { Paged } = require("../../domain/utils");

const Op = sequelize.Op;
const spp = models.spp;

async function getSpp(keyword, size, page) {
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

  // Return with findandcountall
  await spp
    .findAndCountAll({
      limit: sized,
      offset: paged * sized,
      where: data,
      order: [["tahun", "ASC"]],
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

async function getSppbyId(idSpp) {
  // Return with findone
  await spp
    .findOne({ where: { id_spp: idSpp } })
    .then((lng) => {
      if (lng.count > 0) {
        return lng;
      } else {
        return errorHandling.NOT_FOUND;
      }
    });
}

async function insSpp(
  tahun,
  nominal,
  angkatan
) {
  const data = {
    tahun: tahun,
    nominal: nominal,
    angkatan:angkatan
  };

  return await spp.create(data);
}

async function putSpp(
    idSpp,
    tahun,
    nominal,
    angkatan
) {
    const data = {
        tahun: tahun,
        nominal: nominal,
        angkatan:angkatan
      };

  // Check if data is exists
  await spp
    .findOne({ where: { id_spp: idSpp } })
    .then((found) => {
      if (found) {
        // Update spp
        spp
          .update(data, { where: { id_spp: idSpp } })
          .then(() => {
            return spp.findOne({
              where: { id_spp: idSpp },
            });
          });
      } else {
        return errorHandling.NOT_FOUND;
      }
    });
}

async function delSpp(idSpp) {
  // Get data before it's get deleted
  await spp
    .findOne({ where: { id_spp: idSpp } })
    .then((data) => {
      if (data) {
        spp
          .destroy({ where: { id_spp: idSpp } })
          .then(() => {
            return data;
          });
      } else {
        return errorHandling.NOT_FOUND;
      }
    });
}

module.exports = {
  getSpp,
  getSppbyId,
  insSpp,
  putSpp,
  delSpp,
};
