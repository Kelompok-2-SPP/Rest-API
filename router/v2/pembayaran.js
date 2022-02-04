const express = require("express");
const services = require("../../data/services");
const {
  FixedResponse,
  authVerify,
  accessLimit,
  checkNull,
} = require("../../domain/utils");
const { errorHandling, roles } = require("../../domain/const");

const app = express();
const pembayaran = services.pembayaran;
const tunggakan = services.tunggakan;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- GET
app.get("/", async (req, res) => {
  // Fetch data from query params
  const { id_pembayaran, keyword, size, page } = req.query;

  // Check if have id_pembayaran param
  if (id_pembayaran) {
    // Call services getPembayaranbyId
    await pembayaran
      .getPembayaranbyId(id_pembayaran)
      .then((data) => {
        switch (data) {
          // Check data is found or not
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse((code = res.statusCode)));
            break;
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          // Return data to user
          default:
            res
              .status(200)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = ""),
                  (details = data)
                )
              );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Call services getPembayaran
    await pembayaran
      .getPembayaran(keyword, size, page)
      .then((data) => {
        // Check data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
          res
            .status(200)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message = ""),
                (details = data)
              )
            );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  }
});

// -- GET TUNGGAKAN
app.get("/tunggakan", async (req, res) => {
  // Fetch data from query params
  const { nisn } = req.query;

  if (nisn) {
    await tunggakan
      .calculateTunggakan(nisn)
      .then((data) => {
        if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
        } else {
          res.status(200).json(new FixedResponse(res.statusCode, "", data));
        }
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    res
      .status(422)
      .json(
        new FixedResponse(
          res.statusCode,
          "Required query params is missing !, nisn"
        )
      );
  }
});

// -- POST
app.post("/", accessLimit([roles.admin, roles.petugas]), async (req, res) => {
  // Fetch data from body
  const {
    id_petugas,
    nisn,
    tgl_bayar,
    id_spp,
    bulan_spp,
    tahun_spp,
    jumlah_bayar,
  } = req.body;

  // Check if have required body
  if (
    id_petugas &&
    nisn &&
    tgl_bayar &&
    id_spp &&
    bulan_spp &&
    tahun_spp &&
    jumlah_bayar
  ) {
    // Call services insertPembayaran
    await pembayaran
      .insPembayaran(
        id_petugas,
        nisn,
        tgl_bayar,
        id_spp,
        bulan_spp,
        tahun_spp,
        jumlah_bayar
      )
      .then((data) => {
        switch (data) {
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          case errorHandling.INDEX_NOT_FOUND:
            let msg = "";
            msg += id_petugas ? "Id petugas " + id_petugas + "or " : "";
            msg += nisn ? "Nisn " + nisn + "or " : "";
            msg += id_spp ? "Id spp " + id_spp + "or " : "";
            res
              .status(409)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message =
                    msg +
                    "are not found, please check the data before submitting")
                )
              );
            break;
          // Return data to user
          default:
            res
              .status(201)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = "Data sucessfully inserted"),
                  (details = data)
                )
              );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res.status(422).json(
      new FixedResponse(
        (code = res.statusCode),
        (message =
          "Required body is missing !" +
          (await checkNull({
            id_petugas,
            nisn,
            tgl_bayar,
            id_spp,
            bulan_spp,
            tahun_spp,
            jumlah_bayar,
          })))
      )
    );
  }
});

app.put("/", accessLimit([roles.admin, roles.petugas]), async (req, res) => {
  // Fetch data from body
  const { id_petugas, nisn, id_spp } = req.body;
  const { id_pembayaran } = req.query;

  // Check if have required body
  if (id_pembayaran) {
    // Call services putPembayaran
    await pembayaran
      .putPembayaran(id_pembayaran, req.body)
      .then((data) => {
        switch (data) {
          // Check if bad req or not
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          // Check if data not found
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse((code = res.statusCode)));
            break;
          case errorHandling.INDEX_NOT_FOUND:
            let msg = "";
            msg += id_petugas ? "Id petugas " + id_petugas + "or " : "";
            msg += nisn ? "Nisn " + nisn + "or " : "";
            msg += id_spp ? "Id spp " + id_spp + "or " : "";
            res
              .status(409)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message =
                    msg +
                    "are not found, please check the data before submitting")
                )
              );
            break;
          // Return data to user
          default:
            res
              .status(200)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = "Data sucessfuly updated"),
                  (details = data)
                )
              );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required query params is missing !, id_pembayaran, body (optional) id_petugas or nisn or tgl_bayar or id_spp or bulan_spp or tahun_spp or jumlah_bayar")
        )
      );
  }
});

app.delete("/", accessLimit([roles.admin]), async (req, res) => {
  // Ftech data from query
  const { id_pembayaran } = req.query;

  // Check if have required query
  if (id_pembayaran) {
    // Call services delPembayaran
    await pembayaran
      .delPembayaran(id_pembayaran)
      .then((data) => {
        switch (data) {
          // Check if data is found or not
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse((code = res.statusCode)));
            break;
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          // Return data to user
          default:
            res
              .status(200)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = "Data sucessfuly deleted"),
                  (details = data)
                )
              );
        }
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message = "Required query params is missing !, id_pembayaran")
        )
      );
  }
});

module.exports = app;
