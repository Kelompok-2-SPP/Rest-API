const express = require("express");
const services = require("../../data/services");
const {
  FixedResponse,
  authVerify,
  accessLimit,
  checkNull,
} = require("../../domain/utils");
const { errorHandling } = require("../../data/const");

const app = express();
const pembayaran = services.pembayaran;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- GET
app.get("/", async (req, res) => {
  // Fetch data from query params
  const { id_pembayaran, keyword, size, page } = req.query;

  // Check if have id_pembayaran param
  if (!id_pembayaran) {
    // Call services getPembayaranbyId
    await pembayaran
      .getPembayaranbyId(id_pembayaran)
      .then((data) => {
        // Check data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404), json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
          res
            .status(200)
            .json(new FixedResponse((code = res.statusCode), (details = data)));
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse((code = res), (message = err)));
      });
  } else {
    // Call services getPembayaran
    await pembayaran
      .getPembayaran(((keyword = keyword), (size = size), (page = page)))
      .then((data) => {
        // Check data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404), json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
          res
            .status(200)
            .json(new FixedResponse((code = res.statusCode), (details = data)));
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse((code = res), (message = err)));
      });
  }
});

// -- POST
app.post("/", accessLimit(["admin"]), async (req, res) => {
  // Fetch data from body
  const { idPetugas, nisn, tglDibayar, bulanDibayar, tahunDibayar, idSpp, jumlahBayar } = req.body;

  // Check if have required body
  if (!idPetugas && !nisn && !tglDibayar && !bulanDibayar && !tahunDibayar && !idSpp && !jumlahBayar) {
    // Call services insertPembayaran
    await pembayaran
      .insPembayaran(idPetugas, nisn, tglDibayar, bulanDibayar, tahunDibayar, idSpp, jumlahBayar)
      .then((data) => {
        // Check if double data or not
        if (data == errorHandling.DOUBLE_DATA) {
          res.status(409),
            json(
              new FixedResponse(
                (code = res.statusCode),
                (message =
                  nama_pembayaran + " has been used, try different nama_pembayaran")
              )
            );
          // Return data to user
        } else {
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
        res.status(500).json(new FixedResponse((code = res), (message = err)));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required body is missing !, " +
            await checkNull([nama_pembayaran, jurusan, angkatan]))
        )
      );
  }
});

app.put("/", accessLimit(["admin"]), async (req, res) => {
  // Fetch data from body
  const { id_pembayaran, nama_pembayaran, jurusan, angkatan } = req.body;

  // Check if have required body
  if (!id_pembayaran) {
    // Call services putPembayaran
    await pembayaran
      .putPembayaran(id_pembayaran, nama_pembayaran, jurusan, angkatan)
      .then((data) => {
        // Check if double data or not
        if (data == errorHandling.DOUBLE_DATA) {
          res.status(409),
            json(
              new FixedResponse(
                (code = res.statusCode),
                (message =
                  nama_pembayaran + " has been used, try different nama_pembayaran")
              )
            );
          // Check if data not found
        } else if (data == errorHandling.NOT_FOUND) {
          res.status(404), json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
          res
            .status(200)
            .json(new FixedResponse((code = res.statusCode), (details = data)));
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse((code = res), (message = err)));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required body is missing !, " +
            await checkNull([id_pembayaran, nama_pembayaran, jurusan, angkatan]))
        )
      );
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
  // Ftech data from query
  const { id_pembayaran } = req.query;

  // Check if have required query
  if (!id_pembayaran) {
    // Call services delPembayaran
    await pembayaran
      .delPembayaran(id_pembayaran)
      .then((data) => {
        // Check if data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404), json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
          res
            .status(200)
            .json(new FixedResponse((code = res.statusCode), (details = data)));
        }
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse((code = res), (message = err)));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message = "Required query is missing !, id_pembayaran")
        )
      );
  }
});

module.exports = app;
